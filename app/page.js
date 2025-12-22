// app/page.tsx
"use client";
import MapProvider from "@/lib/mapbox/provider";
import { useRef, useState } from "react";
import MapStyles from "./components/map/map-styles";
import MapControls from "./components/map/map-controls";
import Page from "./components/header/HeaderContent";
import Layers from "./components/Layers/layers";
import Sawmilldetails from "./components/data/sawmilldetails";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/state/store";
import { SummaryHPR } from "./components/data/summary-hpr/summaryHpr";

export default function Home() {
  const mapContainerRef = useRef(null);
  const legendUrl = useAppStore((s) => s.legendUrl)
  return (

      <div className="w-screen h-screen">
        <MapProvider
          mapContainerRef={mapContainerRef}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 2,
          }}
        >
          <Page mapContainerRef={mapContainerRef} >

            <div
              id="map-container"
              ref={mapContainerRef}
              className="relative h-full w-full"
            >
              <div className="absolute top-0 right-0 z-20 p-2">
                <SummaryHPR />
              </div>
              <div className="w-full absolute bottom-2 right-2 flex justify-between items-end px-6 gap-2 z-10">
                <MapStyles />

                {legendUrl !== "" ? (
                  <img
                    alt="legend"
                    src={legendUrl}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                ) : null}

                <MapControls />

              </div>
            </div>

            <Sawmilldetails />
          </Page>


        </MapProvider>

      </div>
  );
}
