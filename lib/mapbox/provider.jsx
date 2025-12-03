"use client";
import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";
import { AnimatePresence, motion } from "motion/react";
import StemPopup from "@/app/components/data/HPR/HprStem"
import dynamic from "next/dynamic";

const Details = dynamic(() => import("@/app/components/data/harvestingdetails"), {
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

  const sidebarState = useAppStore((s) => s.sidebarState)
  const setMap = useAppStore((s) => s.setMap)
  const countryCode = useAppStore((s) => s.country);


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

    setMap(map.current);

    map.current.on("load", () => {
      setLoaded(true);
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
    if (!map.current) return;

    const coordinates = countryCode === "Sweden" 
      ? [ 20.263035, 63.825848]
      : [22.4187199, 61.7570299];

    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      speed: 0.75,
      curve: 1,
      essential: true,
    });
  }, [countryCode]);


  useEffect(() => {
    const timer = setTimeout(() => {
      map.current?.resize();
    }, 300);

    return () => clearTimeout(timer);
  }, [sidebarState])



  return (
    <div className="">
      <MapContext.Provider value={{ map: map.current }}>



        {children}
      </MapContext.Provider>


      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-lg font-medium">Loading map...</div>
        </div>
      ) : (
        <Details />
      )}


    </div>
  );
}


