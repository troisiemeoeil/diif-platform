// app/page.tsx
"use client";
import MapProvider from "@/lib/mapbox/provider";
import { useRef, useState } from "react";
import MapCotrols from "./components/map/map-controls";
import MapStyles from "./components/map/map-styles";
import MapControls from "./components/map/map-controls";
import { Button } from "@/components/ui/button";
import Sawmilldetails from "./components/data/sawmilldetails";

export default function Home() {
  const mapContainerRef = useRef(null);

  return (
    <div className="w-screen h-screen">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />


      {/* longitude: 22.417009833811655,
      latitude: 61.75791435320387, */}
      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 2,
        }}

      >
          <MapStyles />
          <Sawmilldetails />
      
        <MapControls />

      </MapProvider>
    </div>
  );
}
