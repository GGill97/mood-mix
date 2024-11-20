import { useState, useCallback } from "react";
import useGeolocation from "./useGeolocation";

interface LocationManagerReturn {
  location: string;
  locationError: string | null;
  weatherDescription: string;
  isLoading: boolean;
  setLocation: (location: string) => void;
  setLocationError: (error: string | null) => void;
  setWeatherDescription: (description: string) => void;
  handleLocationSearch: (query: string) => Promise<void>;
  handleLocationClick: () => Promise<void>;
  handleWeatherUpdate: (description: string) => void;
}

export const useLocationManager = (): LocationManagerReturn => {
  const [location, setLocation] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { requestGeolocation } = useGeolocation();

  const fetchWeatherData = async (searchQuery: string) => {
    setIsLoading(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setLocation(data.name);
      setWeatherDescription(data.weather[0]?.description || "");
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch weather data";
      setLocationError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) {
      setLocation("");
      setWeatherDescription("");
      return;
    }

    try {
      await fetchWeatherData(query);
    } catch (error) {
      console.error("Location search error:", error);
    }
  };

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

      await fetchWeatherData(data.cityName);
    } catch (err) {
      setLocationError(
        "Unable to determine your location. Please try entering it manually."
      );
    }
  };

  const handleWeatherUpdate = useCallback((description: string) => {
    setWeatherDescription(description);
  }, []);

  return {
    location,
    locationError,
    weatherDescription,
    isLoading,
    setLocation,
    setLocationError,
    setWeatherDescription,
    handleLocationSearch,
    handleLocationClick,
    handleWeatherUpdate,
  };
};

export default useLocationManager;
