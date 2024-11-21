import { useState, useEffect } from "react";

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
}

export function useWeather(location: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(location)}`
        );
        if (!response.ok) throw new Error("Failed to fetch weather data");
        const weatherData = await response.json();
        setData(weatherData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      }
    };

    fetchWeather();
  }, [location]);

  return { data, error };
}
