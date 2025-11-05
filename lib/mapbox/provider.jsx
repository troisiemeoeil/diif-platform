"use client";
import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";
import dynamic from "next/dynamic";
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const Details = dynamic(() => import("@/app/components/data/harvestingdetails"), {
  ssr: false,
});

import { useAppStore } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Icon } from "lucide-react";
import Image from "next/image";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}) {
  const map = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const [activeLayerIds, setActiveLayerIds] = useState(['3d-ply-layer',]);

  const wmsLayers = {
    layer1:
      "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
    layer2:
      "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
  };
  //  const [layerType, setLayerType] = useState("wms");
  const [activeLayer, setActiveLayer] = useState("layer1"); // layer1 or layer


  useEffect(() => {
    if (!mapContainerRef.current || map.current) return;
    console.log(initialViewState);

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
      logoPosition: "bottom-right",
    });





    map.current.on("load", () => {
      setLoaded(true);
      map.current.flyTo({
        center: [22.4187199, 61.7570299],
        zoom: 15,
        speed: 0.75,
        curve: 1,
        essential: true,
      });
    });


    map.current.on("style.load", () => {
      if (!map.current.getSource('diif')) {
        map.current.addSource('diif', {
          type: 'geojson',
          data: '/GeoCoor.geojson',
          promoteId: "StemKey",
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40
        });

        Object.entries(wmsLayers).forEach(([key, url]) => {
          if (!map.current.getSource(key)) {
            map.current.addSource(key, {
              type: "raster",
              tiles: [url],
              tileSize: 256,
            });

            map.current.addLayer({
              id: key,
              type: "raster",
              source: key,
              layout: { visibility: activeLayerIds.includes(key) ? "visible" : "none" },
            });
          }
        });


        const customLayer = {
          id: '3d-ply-layer',
          type: 'custom',
          renderingMode: '3d',
          layout: {
            visibility: 'visible'
          },
          onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            gl.cullFace(gl.BACK)

            const ambient = new THREE.AmbientLight(0xffffff, 0.5);
            const directional = new THREE.DirectionalLight(0xffffff, 0.5);
            this.scene.add(ambient);
            this.scene.add(directional);

            this.loader = new PLYLoader();
            this.pointsLoaded = false;

            this.loader.load('/300K_points.ply', (geometry) => {
              geometry.computeBoundingBox();
              geometry.center();

              const material = new THREE.PointsMaterial({
                size: 1.2,
                vertexColors: !!geometry.hasAttribute('color'),
                color: geometry.hasAttribute('color') ? undefined : 0x00ff88,
                sizeAttenuation: true
              });

              this.points = new THREE.Points(geometry, material);
              this.scene.add(this.points);

              const lng = 22.4190383;
              const lat = 61.7569133;
              const alt = 20;

              const merc = mapboxgl.MercatorCoordinate.fromLngLat({ lng, lat }, alt);
              const scale = merc.meterInMercatorCoordinateUnits() * 2.25;
              const offsetX = 0;
              const offsetY = 0;
              const offsetZ = 0;
              const matrix = new THREE.Matrix4()
                .makeTranslation(merc.x + offsetX, merc.y + offsetY, merc.z + offsetZ)
                .multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(18)))
                .scale(new THREE.Vector3(scale, -scale, scale));
              this.points.applyMatrix4(matrix);
              this.pointsLoaded = true;
              map.triggerRepaint();
            });

            map.on('styledata', () => {
              if (this.pointsLoaded) {
                map.triggerRepaint();
              }
            });

            this.renderer = new THREE.WebGLRenderer({
              canvas: map.getCanvas(),
              context: gl,
              antialias: true
            });

            this.renderer.autoClear = false;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
          },

          render: function (gl, matrix) {
            if (!this.pointsLoaded) return;

            const m = new THREE.Matrix4().fromArray(matrix);
            this.camera.projectionMatrix = m;
            this.renderer.render(this.scene, this.camera);
            map.current.triggerRepaint();
            this.renderer.resetState()
          }
        };

        //add point clouds layer
        map.current.addLayer(customLayer);

        //add clustered points 1K layer
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'diif',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'highlight'], false],
              '#ff0000',
              '#34a8cf'
            ],
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-emissive-strength': 1
          }
        });
        //add clustered points layer 2

        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'diif',

          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ],
            'circle-emissive-strength': 1
          }
        });

        //add unclustered points layer

        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'diif',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });


      }
    });





    if (map.current.hasInteraction && map.current.hasInteraction('click-clusters')) {
      map.current.removeInteraction('click-clusters');
    }

    map.current.addInteraction('click-clusters', {
      type: 'click',
      target: { layerId: 'clusters' },
      handler: (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current
          .getSource('diif')
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          });
      }
    });

    if (map.current.hasInteraction && map.current.hasInteraction('click-unclustered')) {
      map.current.removeInteraction('click-unclustered');
    }

    map.current.addInteraction("click-unclustered", {
      type: "click",
      target: { layerId: "unclustered-point" },
      handler: (e) => {
        const coordinates = e.feature.geometry.coordinates.slice();
        const stemKey = e.feature.properties.StemKey;
        const stemInfoRaw = e.feature.properties.stemInfo;
        const stemInfo =
          typeof stemInfoRaw === "string"
            ? JSON.parse(stemInfoRaw)
            : stemInfoRaw;

        const popupNode = document.createElement("div");

        const root = createRoot(popupNode);
        root.render(
          <StemPopup
            stemKey={stemKey}
            stemInfo={stemInfo}
            onOpen={(key, info) => {
              useAppStore.getState().setStemKey(key);
              useAppStore.getState().setStemInfo(info);
              useAppStore.getState().setSheetOpen(true);
            }}
          />
        );

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupNode) // instead of setHTML
          .addTo(map.current);
      },
    });

    if (map.current.hasInteraction && map.current.hasInteraction('clustered-mouseenter')) {
      map.current.removeInteraction('clustered-mouseenter');
    }


    map.current.addInteraction('clustered-mouseenter', {
      type: 'mouseenter',
      target: { layerId: 'clusters' },
      handler: () => {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });


    if (map.current.hasInteraction && map.current.hasInteraction('clustered-mouseleave')) {
      map.current.removeInteraction('clustered-mouseleave');
    }
    // Change the cursor back to a pointer when it stops hovering over a cluster of POIs.
    map.current.addInteraction('clustered-mouseleave', {
      type: 'mouseleave',
      target: { layerId: 'clusters' },
      handler: () => {
        map.current.getCanvas().style.cursor = '';
      }
    });
    if (map.current.hasInteraction && map.current.hasInteraction('unclustered-mouseenter')) {
      map.current.removeInteraction('unclustered-mouseenter');
    }
    // Change the cursor to a pointer when the mouse is over an individual POI.
    map.current.addInteraction('unclustered-mouseenter', {
      type: 'mouseenter',
      target: { layerId: 'unclustered-point' },
      handler: () => {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });
    if (map.current.hasInteraction && map.current.hasInteraction('unclustered-mouseleave')) {
      map.current.removeInteraction('unclustered-mouseleave');
    }
    // Change the cursor back to a pointer when it stops hovering over an individual POI.
    map.current.addInteraction('unclustered-mouseleave', {
      type: 'mouseleave',
      target: { layerId: 'unclustered-point' },
      handler: () => {
        map.current.getCanvas().style.cursor = '';
      }
    });


    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialViewState, mapContainerRef]);

  useEffect(() => {
    if (!map.current || !loaded) return;

    const allLayerIds = ['3d-ply-layer', 'layer1', 'layer2'];

    allLayerIds.forEach((layerId) => {
      if (!map.current.getLayer(layerId)) return;
      const visibility = activeLayerIds.includes(layerId) ? 'visible' : 'none';
      map.current.setLayoutProperty(layerId, 'visibility', visibility);
    });
  }, [activeLayerIds, loaded]);



  const handleClick = (e) => {
    const layerId = e.currentTarget.id;
    if (!layerId) return;

    setActiveLayerIds((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="">
      <MapContext.Provider value={{ map: map.current }}>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[999]">
          <div className="absolute top-2 left-2 flex flex-col gap-4 pointer-events-auto">

            <button
              id="layer1"
              onClick={handleClick}
              className="p-0 relative border-none bg-transparent cursor-pointer"
            >
              <img
                src="/fsv.png"
                width={500}
                height={100}
                className="object-cover w-60 h-20 rounded-md bg-blend-overlay"
                alt="FSV button image"
              />
              <span className="text-white font-bold text-md absolute bottom-0 left-2">FOREST RESERVE PATTERNS </span>

            </button>
            <button
              id="layer2"
              onClick={handleClick}
              className="p-0 relative border-none bg-transparent cursor-pointer"
            >
              <img
                src="/fudv.png"
                width={500}
                height={100}
                className="object-cover w-60 h-20 rounded-md bg-blend-overlay"
                alt="FUDV button image"
              />
              <span className="text-white font-bold text-md absolute bottom-0 left-2">FOREST USE NOTIFICATIONS</span>
            </button>


            <button
              id="3d-ply-layer"
              onClick={handleClick}
              className="p-0 relative border-none bg-transparent cursor-pointer"
            >
              <img
                src="/pointcloud.jpg"
                width={500}
                height={100}
                className="object-cover w-60 h-20 rounded-md bg-blend-overlay"
                alt="Point Clouds button image"
              />
              <span className="text-white font-bold text-md absolute bottom-0 left-2">POINT CLOUD</span>

            </button>

          </div>
        </div>

        {children}
      </MapContext.Provider>
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-lg font-medium">Loading map...</div>
        </div>
      ) : (
        <Details />
      )}


    </div>
  );
}


function StemPopup({ stemKey, stemInfo, onOpen }) {
  return (
    <div style={{ padding: "8px 8px", width: "auto", borderRadius: "0" }}>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex flex-col ">
            <h1 className="text-sm">
              <strong>Stem Number</strong>
            </h1>
            <span className="text-5xl font-bold">{stemInfo.StemNumber}</span>
            <h3 className="text-xs text-gray-400">Species Group Key: <strong className="text-gray-600">{stemInfo.SpeciesGroupKey}</strong></h3>
          </div>
        </div>
        <ArrowUpRight

          className="cursor-pointer p-1 bg-black text-white w-[35px] h-auto border-0 rounded-full hover:bg-gray-500"
          onClick={() => onOpen(stemKey, stemInfo)}
        />
      </div>
    </div>
  );
}



