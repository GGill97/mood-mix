/**
 * useLocationManager.ts
 * Custom hook for managing location-related state and actions
 *
 * Pseudocode:
 * 1. Initialize states for location, error, and weather
 * 2. Create handlers for:
 *    - Setting location and clearing error
 *    - Setting location error
 *    - Setting weather description
 *    - Handling location search
 * 3. Return state and handlers
 */

import { useState } from "react";
import useGeolocation from "./useGeolocation";

interface LocationManagerReturn {
  // States
  location: string;
  locationError: string | null;
  weatherDescription: string;
  isLoading: boolean;

  // Setters
  setLocation: (location: string) => void;
  setLocationError: (error: string | null) => void;
  setWeatherDescription: (description: string) => void;

  // Handlers
  handleLocationSearch: (query: string) => void;
  handleLocationClick: () => Promise<void>;
  handleWeatherUpdate: (description: string) => void;
}

export const useLocationManager = (): LocationManagerReturn => {
  // State Management
  const [location, setLocation] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string>("");

  // Geolocation Hook
  const { isLoading, requestGeolocation } = useGeolocation();

  // Location Search Handler
  const handleLocationSearch = (query: string) => {
    setLocationError(null);
    setLocation(query);
  };

  // Get Current Location Handler
  const handleLocationClick = async () => {
    setLocationError(null);
    try {
      const coords = await requestGeolocation();
      if (!coords) throw new Error("Unable to get coordinates");

      const response = await fetch(
        `/api/weather/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`
      );
      if (!response.ok) throw new Error("Failed to get location name");

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setLocation(data.cityName);
    } catch (err) {
      setLocationError(
        "Unable to determine your city. Please try entering it manually."
      );
    }
  };

  // Weather Update Handler
  const handleWeatherUpdate = (description: string) => {
    setWeatherDescription(description);
  };

  return {
    // States
    location,
    locationError,
    weatherDescription,
    isLoading,

    // Setters
    setLocation,
    setLocationError,
    setWeatherDescription,

    // Handlers
    handleLocationSearch,
    handleLocationClick,
    handleWeatherUpdate,
  };
};

export default useLocationManager;
