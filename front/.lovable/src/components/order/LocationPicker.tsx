import { useEffect, useRef, useState, type ComponentType } from "react";
import { Crosshair, Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { searchAddressSuggestions, type AddressSuggestion } from "@/services/geocoding.service";
import { cn } from "@/lib/utils";
import type { GeoPoint } from "@/types";
import { isInCasablanca } from "./geo";

type MapViewProps = {
  value: GeoPoint | null;
  recenterKey: number;
  onChange: (point: GeoPoint) => void;
  onOutsideCity: () => void;
  onTileError: () => void;
};

type GeoMessage = { key: string; kind: "error" | "success" } | null;
type LocationSource = "none" | "gps" | "manual" | "geocoder";

/** Client-only Leaflet map, address suggestions and browser geolocation. */
export function LocationPicker({
  value,
  address,
  error,
  onChange,
}: {
  value: GeoPoint | null;
  address: string;
  error?: string | undefined;
  onChange: (point: GeoPoint | null) => void;
}) {
  const { t } = useI18n();
  const [MapView, setMapView] = useState<ComponentType<MapViewProps> | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [geoMessage, setGeoMessage] = useState<GeoMessage>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [pendingSuggestion, setPendingSuggestion] = useState<AddressSuggestion | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [tileError, setTileError] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);
  const locationSource = useRef<LocationSource>(value ? "manual" : "none");
  const currentPoint = useRef(value);
  const onChangeRef = useRef(onChange);
  const selectedAddressQuery = useRef<string | null>(null);
  const searchGeneration = useRef(0);
  const cancelAddressSearch = useRef<() => void>(() => {});

  useEffect(() => {
    let active = true;
    import("./LeafletMapView")
      .then(({ LeafletMapView }) => {
        if (active) setMapView(() => LeafletMapView);
      })
      .catch(() => {
        if (active) setTileError(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    currentPoint.current = value;
    if (!value) locationSource.current = "none";
  }, [value]);

  useEffect(() => {
    const query = address.trim().replace(/\s+/g, " ");
    const generation = ++searchGeneration.current;
    const controller = new AbortController();
    setSearchingAddress(false);
    setSuggestions([]);
    setPendingSuggestion(null);
    setAddressMessage(null);
    setDetectedAddress(null);

    if (selectedAddressQuery.current && selectedAddressQuery.current !== query && locationSource.current === "geocoder") {
      currentPoint.current = null;
      locationSource.current = "none";
      onChangeRef.current(null);
    }
    selectedAddressQuery.current = null;

    if (!query) return () => controller.abort();

    const timer = window.setTimeout(() => {
      if (query.length < 6) {
        setAddressMessage("addressSearchTooShort");
        return;
      }

      setSearchingAddress(true);
      void searchAddressSuggestions(query, controller.signal)
        .then((results) => {
          if (generation !== searchGeneration.current) return;
          setSearchingAddress(false);

          if (results.length === 0) {
            setAddressMessage("addressSearchNoResult");
            return;
          }

          if (results.length === 1) {
            const result = results[0];
            if (!result) return;
            if (locationSource.current === "manual" && currentPoint.current) {
              setPendingSuggestion(result);
              setAddressMessage("addressManualPositionKept");
              return;
            }
            applySuggestion(result, query);
            return;
          }

          setSuggestions(results);
          setAddressMessage(locationSource.current === "manual" && currentPoint.current
            ? "addressManualPositionKept"
            : "addressSearchMultiple");
        })
        .catch((searchError: unknown) => {
          if (controller.signal.aborted || generation !== searchGeneration.current) return;
          setSearchingAddress(false);
          setAddressMessage(searchError && typeof searchError === "object" && "status" in searchError && searchError.status === 429
            ? "addressSearchRateLimited"
            : "addressSearchFailed");
        });
    }, 800);
    cancelAddressSearch.current = () => {
      window.clearTimeout(timer);
      controller.abort();
      searchGeneration.current++;
      setSearchingAddress(false);
    };

    return () => {
      window.clearTimeout(timer);
      controller.abort();
      if (searchGeneration.current === generation) searchGeneration.current++;
    };
    // Address changes intentionally trigger a new debounced lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const setLocation = (point: GeoPoint | null, source: LocationSource) => {
    currentPoint.current = point;
    locationSource.current = source;
    onChangeRef.current(point);
  };

  const applySuggestion = (suggestion: AddressSuggestion, query: string) => {
    const point = { lat: suggestion.lat, lng: suggestion.lng };
    if (!isInCasablanca(point)) {
      setAddressMessage("addressSearchNoResult");
      return;
    }
    setLocation(point, "geocoder");
    selectedAddressQuery.current = query;
    setDetectedAddress(suggestion.label);
    setPendingSuggestion(null);
    setSuggestions([]);
    setAddressMessage("addressPositionFound");
    setGeoMessage(null);
    setRecenterKey((current) => current + 1);
  };

  const choosePoint = (point: GeoPoint) => {
    setLocation(point, "manual");
    setPendingSuggestion(null);
    setDetectedAddress(null);
    setGeoMessage(null);
  };

  const locate = () => {
    cancelAddressSearch.current();
    setGeoMessage(null);
    if (!window.isSecureContext) {
      setGeoMessage({ key: "geoRequiresSecureContext", kind: "error" });
      return;
    }
    if (!navigator.geolocation) {
      setGeoMessage({ key: "geoNotSupported", kind: "error" });
      return;
    }

    setLocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = {
            lat: Number(position.coords.latitude.toFixed(7)),
            lng: Number(position.coords.longitude.toFixed(7)),
          };
          setLocating(false);
          if (!isInCasablanca(point)) {
            setGeoMessage({ key: "outsideCity", kind: "error" });
            return;
          }
          setLocation(point, "gps");
          setPendingSuggestion(null);
          setDetectedAddress(null);
          setRecenterKey((current) => current + 1);
          setGeoMessage({ key: "located", kind: "success" });
        },
        (geolocationError) => {
          setLocating(false);
          const key = geolocationError.code === 1
            ? "geoPermissionDenied"
            : geolocationError.code === 3
              ? "geoTimeout"
              : "geoUnavailable";
          setGeoMessage({ key, kind: "error" });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    } catch {
      setLocating(false);
      setGeoMessage({ key: "geoUnavailable", kind: "error" });
    }
  };

  const handleOutsideCity = () => setGeoMessage({ key: "mapOutsideCity", kind: "error" });

  return (
    <section aria-label={t("order.documents.gpsTitle")}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t("order.documents.gpsTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("order.documents.gpsText")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={locate} disabled={locating}>
          {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
          {locating ? t("order.documents.locating") : t("order.documents.useMyLocation")}
        </Button>
      </div>

      {searchingAddress && (
        <p role="status" className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> {t("order.documents.addressSearching")}
        </p>
      )}
      {addressMessage && (
        <p role="status" className={cn("mb-2 text-xs", addressMessage === "addressPositionFound" ? "text-success" : "text-muted-foreground")}>
          {t(`order.documents.${addressMessage}`)}
        </p>
      )}
      {detectedAddress && (
        <p className="mb-2 break-words text-xs font-medium" aria-live="polite">
          {t("order.documents.addressDetected", { address: detectedAddress })}
        </p>
      )}
      {pendingSuggestion && (
        <div className="mb-3 rounded-lg border bg-muted/40 p-3 text-xs">
          <p className="mb-2">{t("order.documents.addressManualPositionKept")}</p>
          <p className="mb-2 font-medium">{pendingSuggestion.label}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => applySuggestion(pendingSuggestion, address.trim().replace(/\s+/g, " "))}>
            {t("order.documents.addressUseSuggestion")}
          </Button>
        </div>
      )}
      {suggestions.length > 1 && (
        <div role="listbox" aria-label={t("order.documents.addressSearchMultiple")} className="mb-3 max-h-44 overflow-y-auto rounded-lg border bg-card p-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => applySuggestion(suggestion, address.trim().replace(/\s+/g, " "))}
              className="block w-full rounded-md px-3 py-2 text-start text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <div dir="ltr" className={cn("h-72 w-full overflow-hidden rounded-xl border-2 sm:h-[22rem]", error ? "border-destructive/60" : "border-border")}>
        {MapView ? (
          <MapView
            value={value}
            recenterKey={recenterKey}
            onChange={choosePoint}
            onOutsideCity={handleOutsideCity}
            onTileError={() => setTileError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-2 bg-muted/60 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" /> {t("order.documents.mapLoading")}
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">{t("order.documents.addressSearchPrivacy")}</p>
      <div className="mt-2 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs">
        {value ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-success" dir="ltr" aria-live="polite">
            <MapPin className="size-3.5" /> {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
        ) : (
          <span className="text-muted-foreground">{t("order.documents.mapSelectLocation")}</span>
        )}
        {value && (
          <button type="button" onClick={() => { setLocation(null, "none"); setGeoMessage(null); setDetectedAddress(null); setPendingSuggestion(null); }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" /> {t("order.documents.clearLocation")}
          </button>
        )}
      </div>

      {geoMessage && (
        <p role={geoMessage.kind === "error" ? "alert" : "status"} className={cn("mt-2 text-xs font-medium", geoMessage.kind === "error" ? "text-destructive" : "text-success")}>
          {t(`order.documents.${geoMessage.key}`)}
        </p>
      )}
      {tileError && <p role="status" className="mt-2 text-xs text-amber-700">{t("order.documents.mapTileError")}</p>}
      {error && !value && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{t(`common.${error}`)}</p>}
    </section>
  );
}
