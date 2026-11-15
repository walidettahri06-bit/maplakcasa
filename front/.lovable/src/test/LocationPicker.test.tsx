import { createElement } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeoPoint } from "@/types";
import { businessConfig } from "@/config/business";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LocationPicker } from "@/components/order/LocationPicker";

vi.mock("@/components/order/LeafletMapView", async () => {
  const React = await import("react");
  return {
    LeafletMapView: ({ value, recenterKey }: { value: GeoPoint | null; recenterKey: number }) =>
      React.createElement("div", {
        "data-testid": "leaflet-map",
        "data-lat": value?.lat ?? "",
        "data-lng": value?.lng ?? "",
        "data-recenter-key": recenterKey,
      }),
  };
});

type SuccessCallback = PositionCallback;
type FailureCallback = PositionErrorCallback;

describe("LocationPicker browser geolocation", () => {
  let onChange: (point: GeoPoint | null) => void;
  let changedPoints: (GeoPoint | null)[];
  let successCallback: SuccessCallback | undefined;
  let failureCallback: FailureCallback | undefined;
  let getCurrentPosition: ReturnType<typeof vi.fn>;

  const renderPicker = () => render(
    createElement(I18nProvider, null,
    createElement(LocationPicker, { value: null, address: "", onChange })),
  );

  const clickLocate = async () => {
    await screen.findByTestId("leaflet-map");
    fireEvent.click(screen.getByRole("button", { name: "Utiliser ma position" }));
  };

  const succeed = () => successCallback?.({
    coords: {
      latitude: businessConfig.cityCenter.lat,
      longitude: businessConfig.cityCenter.lng,
      accuracy: 8,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as GeolocationPosition);

  const fail = (code: number) => failureCallback?.({ code, message: "test" } as GeolocationPositionError);

  beforeEach(() => {
    changedPoints = [];
    onChange = (point) => changedPoints.push(point);
    successCallback = undefined;
    failureCallback = undefined;
    getCurrentPosition = vi.fn((success: SuccessCallback, failure: FailureCallback) => {
      successCallback = success;
      failureCallback = failure;
    });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("requests a fresh high-accuracy position, updates the form, and recenters the map", async () => {
    renderPicker();
    await clickLocate();

    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    expect(screen.getByRole("button", { name: "Détection de votre position..." })).toBeDisabled();

    await act(async () => succeed());

    await waitFor(() => expect(changedPoints).toContainEqual({
      lat: businessConfig.cityCenter.lat,
      lng: businessConfig.cityCenter.lng,
    }));
    expect(await screen.findByText("Votre position a été détectée avec succès")).toBeInTheDocument();
    expect(screen.getByTestId("leaflet-map")).toHaveAttribute("data-recenter-key", "1");
  });

  it("shows the exact permission-denied guidance", async () => {
    renderPicker();
    await clickLocate();
    await act(async () => fail(1));
    expect(await screen.findByText("Autorisez l'accès à votre position dans les paramètres de votre navigateur.")).toBeInTheDocument();
  });

  it("shows the unavailable-position guidance", async () => {
    renderPicker();
    await clickLocate();
    await act(async () => fail(2));
    expect(await screen.findByText("Impossible de détecter votre position. Vérifiez votre GPS ou votre connexion.")).toBeInTheDocument();
  });

  it("shows the timeout guidance", async () => {
    renderPicker();
    await clickLocate();
    await act(async () => fail(3));
    expect(await screen.findByText("La détection prend trop de temps. Réessayez.")).toBeInTheDocument();
  });

  it("allows retry after a failed detection", async () => {
    renderPicker();
    await clickLocate();
    await act(async () => fail(2));
    expect(await screen.findByText("Impossible de détecter votre position. Vérifiez votre GPS ou votre connexion.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Utiliser ma position" }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    await act(async () => succeed());

    expect(await screen.findByText("Votre position a été détectée avec succès")).toBeInTheDocument();
    expect(changedPoints).toHaveLength(1);
  });

  it("reports browsers without geolocation support", async () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });
    renderPicker();
    await clickLocate();
    expect(await screen.findByText("Votre navigateur ne prend pas en charge la géolocalisation.")).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
