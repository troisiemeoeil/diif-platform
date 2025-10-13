"use client";

import React, { useEffect, useState } from "react";
import {
  MapIcon,
  MoonIcon,
  SatelliteIcon,
  SunIcon,
  TreesIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useMap } from "@/context/map-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

const STYLE_OPTIONS = [

  {
    id: "satellite-streets-v12",
    label: "Satellite",
    icon: <MapIcon className="w-5 h-5" />,
    image: "./satelitte.jpg"

  },

  {
    id: "outdoors-v12",
    label: "Terrain",
    icon: <TreesIcon className="w-5 h-5" />,
    image: "./terrain.png"
  },

  {
    id: "light-v11",
    label: "Light",
    icon: <SunIcon className="w-5 h-5" />,
    image: "./light.png"

  },
  {
    id: "dark-v11",
    label: "Dark",
    icon: <MoonIcon className="w-5 h-5" />,
    image: "./dark.png"

  },
];

export default function MapStyles() {
  const { map } = useMap();
  const { setTheme } = useTheme();
  const [activeStyle, setActiveStyle] = useState("streets-v12");

  const handleChange = (value) => {
    if (!map) return;
    map.setStyle(`mapbox://styles/mapbox/${value}`);
    setActiveStyle(value);
  };

  useEffect(() => {
    if (activeStyle === "dark-v11") {
      setTheme("dark");
    } else setTheme("light");
  }, [activeStyle]);

  return (
    <aside className="absolute bottom-4 left-4 z-10">
      <Tabs value={activeStyle} onValueChange={handleChange}>
        <TabsList className="bg-background  h-full  shadow-xl">
          {STYLE_OPTIONS.map((style) => (
            <TabsTrigger
              key={style.id}
              value={style.id}
              className="data-[state=active]:border-gray-300 data-[state=active]:border-2 data-[state=active]:margin-1 text-smflex flex-col items-center "
            >
              {/* <div className="">
                {style.icon}
              </div> */}
              <img className="relative object-cover  w-18 h-18 rounded-lg" width="75" height="auto" src={style.image} />
                <span className="hidden text-xs sm:inline">{style.label}</span>

            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </aside>
  );
}