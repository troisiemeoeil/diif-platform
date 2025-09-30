
"use client";

import { useMap } from "@/context/map-context";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";


export default function Popup({
  latitude,
  longitude,
  children,
  marker,
  onClose,
  className,
  ...props
}) {
  const { map } = useMap();

  const container = useMemo(() => {
    return document.createElement("div");
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!map) return;

    const popupOptions = {
      ...props,
      className: `mapboxgl-custom-popup ${className ?? ""}`,
    };

    const popup = new mapboxgl.Popup(popupOptions)
      .setDOMContent(container)
      .setMaxWidth("none");

    popup.on("close", handleClose);

    if (marker) {
      const currentPopup = marker.getPopup();
      if (currentPopup) {
        currentPopup.remove();
      }

      marker.setPopup(popup);

      marker.togglePopup();
    } else if (latitude !== undefined && longitude !== undefined) {
      popup.setLngLat([longitude, latitude]).addTo(map);
    }

    return () => {
      popup.off("close", handleClose);
      popup.remove();

      if (marker && marker.getPopup()) {
        marker.setPopup(null);
      }
    };
  }, [
    map,
    marker,
    latitude,
    longitude,
    props,
    className,
    container,
    handleClose,
  ]);

  return createPortal(children, container);
}