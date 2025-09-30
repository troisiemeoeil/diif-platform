"use client";
import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";
import dynamic from "next/dynamic";

const Details = dynamic(() => import("@/app/components/data/details"), {
  ssr: false,
});

import { useAppStore } from "@/lib/state/store";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Icon } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}) {
  const map = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStemKey, setSelectedStemKey] = useState(null);
  const [selectedStemInfo, setSelectedStemInfo] = useState(null);
  const wmsLayers = {
    layer1:
      "https://avoin.metsakeskus.fi/rajapinnat/v1/stand/ows?service=WMS&request=GetMap&layers=stand&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
    layer2:
      "https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?service=WMS&request=GetMap&layers=forestusedeclaration&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&BBOX={bbox-epsg-3857}",
  };
  //  const [layerType, setLayerType] = useState("wms");
  const [activeLayer, setActiveLayer] = useState("layer1"); // layer1 or layer
  const stemKey = useAppStore((state) => state.stemKey)
  const setStemKey = useAppStore((state) => state.setStemKey)


  useEffect(() => {
    if (!mapContainerRef.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard-satellite",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
      logoPosition: "bottom-right",
    });


    map.current.on("load", () => {
      setLoaded(true);
      addWMSLayer(activeLayer);
    });



    map.current.on("load", () => {
    })





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
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40
        })


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

        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'diif',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-emissive-strength': 1
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
    // Change the cursor to a pointer when the mouse is over a cluster of POIs.
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

  const addWMSLayer = (layerKey) => {
    if (!map.current) return;

    // Remove existing WMS layer & source
    if (map.current.getLayer("wms-layer")) map.current.removeLayer("wms-layer");
    if (map.current.getSource("wms-source")) map.current.removeSource("wms-source");

    // Add new raster source
    map.current.addSource("wms-source", {
      type: "raster",
      tiles: [wmsLayers[layerKey]],
      tileSize: 256,
    });

    map.current.addLayer(
      {
        id: "wms-layer",
        type: "raster",
        source: "wms-source",
      },
      "clusters"
    );
  };


  const handleLayerSwitch = (layerKey) => {
    setActiveLayer(layerKey);
    addWMSLayer(layerKey);
  };


  return (
    <div className="z-[1000]">
      <MapContext.Provider value={{ map: map.current }}>
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 8 }}>
          <Button
            onClick={() => handleLayerSwitch("layer1")}
            className={`px-3 py-1 rounded ${activeLayer === "layer1" ? "bg-blue-300 text-white" : "bg-gray-500"}`}
          >
            Forest Stand View
          </Button>
          <Button
            onClick={() => handleLayerSwitch("layer2")}
            className={`px-3 py-1 rounded ${activeLayer === "layer2" ? "bg-blue-300 text-white" : "bg-gray-500"}`}
          >
            Forest Use Declaration View
          </Button>
        </div>
        {children}
      </MapContext.Provider>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-lg font-medium">Loading map...</div>

        </div>
      )}

      <Details />

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

