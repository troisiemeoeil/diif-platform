
import { MapPin } from "lucide-react";
import Marker from "./map/map-marker";


export function LocationMarker({ location, onHover }) {
  return (
    <Marker
      longitude={location.geometry.coordinates[0]}
      latitude={location.geometry.coordinates[1]}
      data={location}
      onHover={({ data }) => {
        onHover(data);
      }}
    >
      <div className="rounded-full flex items-center justify-center transform transition-all duration-200 bg-rose-500 text-white shadow-lg size-8 cursor-pointer hover:scale-110">
        <MapPin className="stroke-[2.5px] size-4.5" />
      </div>
    </Marker>
  );
}