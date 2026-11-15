import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { businessConfig } from "@/config/business";
import type { GeoPoint } from "@/types";
import { isInCasablanca } from "./geo";
import "leaflet/dist/leaflet.css";

type LeafletMapViewProps = {
  value: GeoPoint | null;
  recenterKey: number;
  onChange: (point: GeoPoint) => void;
  onOutsideCity: () => void;
  onTileError: () => void;
};

const selectedLocationIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:28px;height:28px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px #0008;position:relative"><span style="position:absolute;width:7px;height:7px;background:#fff;border-radius:50%;top:8px;left:8px"></span></span>',
  iconSize: [32, 40],
  iconAnchor: [15, 38],
});

function boundedPoint(point: GeoPoint): GeoPoint {
  return { lat: Number(point.lat.toFixed(7)), lng: Number(point.lng.toFixed(7)) };
}

function MapInteractions({
  value,
  recenterKey,
  onChange,
  onOutsideCity,
}: Omit<LeafletMapViewProps, "onTileError">) {
  const map = useMap();
  // Also center on a location selected before this lazy-loaded map mounted.
  const lastRecenterKey = useRef(-1);

  useMapEvents({
    click(event) {
      const point = boundedPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
      if (!isInCasablanca(point)) {
        onOutsideCity();
        return;
      }
      onChange(point);
    },
  });

  useEffect(() => {
    if (!value || lastRecenterKey.current === recenterKey) return;
    lastRecenterKey.current = recenterKey;
    map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 15), { duration: 0.65 });
  }, [map, recenterKey, value]);

  const markerEvents = useMemo<L.LeafletEventHandlerFnMap>(() => ({
    dragend(event) {
      const marker = event.target as L.Marker;
      const point = boundedPoint({ lat: marker.getLatLng().lat, lng: marker.getLatLng().lng });
      if (isInCasablanca(point)) onChange(point);
      else {
        if (value) marker.setLatLng([value.lat, value.lng]);
        onOutsideCity();
      }
    },
  }), [onChange, onOutsideCity, value]);

  return value ? (
    <Marker
      position={[value.lat, value.lng]}
      icon={selectedLocationIcon}
      draggable
      eventHandlers={markerEvents}
      title="Position de livraison"
      keyboard
    />
  ) : null;
}

export function LeafletMapView(props: LeafletMapViewProps) {
  const { north, south, west, east } = businessConfig.cityBounds;
  const maxBounds = useMemo<L.LatLngBoundsExpression>(() => [[south, west], [north, east]], [north, south, east, west]);

  return (
    <MapContainer
      center={[businessConfig.cityCenter.lat, businessConfig.cityCenter.lng]}
      zoom={13}
      minZoom={11}
      maxZoom={19}
      maxBounds={maxBounds}
      maxBoundsViscosity={0.85}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
        eventHandlers={{ tileerror: props.onTileError }}
      />
      <MapInteractions {...props} />
    </MapContainer>
  );
}
