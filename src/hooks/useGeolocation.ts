"use client";

import { useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const requestGeolocation = async (): Promise<{
    lat: number;
    lon: number;
  } | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;
      setState({
        latitude,
        longitude,
        error: null,
        isLoading: false,
      });

      return { lat: latitude, lon: longitude };
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Unable to retrieve your location",
        isLoading: false,
      }));
      return null;
    }
  };

  return {
    ...state,
    requestGeolocation,
  };
};

export default useGeolocation;
