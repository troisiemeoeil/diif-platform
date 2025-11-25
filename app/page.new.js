// app/page.tsx
"use client";
import MapProvider from "@/lib/mapbox/provider";
import { useRef } from "react";
import MapStyles from "./components/map/map-styles";
import MapControls from "./components/map/map-controls";
import Page from "./dashboard/page";
import Layers from "./components/Layers/layers";

export default function Home() {
  const mapContainerRef = useRef(null);

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
        <Page mapContainerRef={mapContainerRef}>

          {/* Three-column layout: left sidebar (Layers), center map, right controls */}
          <div className="h-full w-full flex">
            {/* Left sidebar (Layers) - fixed width */}
            <div className="w-72 border-r bg-background/50">
              <Layers />
            </div>

            {/* Map container - flex grows */}
            <div className="flex-1 relative">
              <div id="map-container" ref={mapContainerRef} className="h-full w-full" />
            </div>

            {/* Right column for styles/controls - fixed width */}
            <div className="w-56 border-l bg-background/50 p-2">
              <div className="mb-4">
                <MapStyles />
              </div>
              <div>
                <MapControls />
              </div>
            </div>
          </div>

        </Page>
      </MapProvider>

    </div>
  );
}
