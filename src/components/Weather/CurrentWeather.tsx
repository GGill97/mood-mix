/**
 * CurrentWeather Component
 *
 * Purpose:
 * Displays current weather information for a selected location
 * and provides weather updates to parent components.
 *
 * Main Functionality:
 * 1. Fetches weather data for given location
 * 2. Displays temperature, conditions, and weather metrics
 * 3. Updates parent component with weather description
 * 4. Handles loading and error states
 *
 * Component Structure:
 * - WeatherDetail: Sub-component for metric display
 *   - Shows individual weather metrics
 *   - Handles animated entrance
 *
 * - Main Component:
 *   - Manages weather data fetching
 *   - Displays current conditions
 *   - Shows detailed metrics grid
 *
 * Features:
 * - Responsive layout
 * - Loading skeletons
 * - Error handling
 * - Accessibility support
 * - Animated transitions
 *
 * Data Flow:
 * 1. Receives location from props
 * 2. Fetches weather using useWeather hook
 * 3. Updates parent with weather description
 * 4. Renders weather information
 *
 * External Dependencies:
 * - Weather API integration
 * - Custom useWeather hook
 * - Weather icons component
 */

import React, { useEffect, useRef } from "react";
import { useWeather } from "@/hooks/useWeather";
import WeatherIcon from "./WeatherIcon";
import { FaThermometerHalf, FaTint, FaWind, FaCompass } from "react-icons/fa";

// === TYPE DEFINITIONS ===
interface CurrentWeatherProps {
  location: string;
  onWeatherUpdate: (description: string) => void;
}

interface WeatherDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: string;
}

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
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

// === SUB-COMPONENTS ===
const WeatherDetail: React.FC<WeatherDetailProps> = ({
  icon,
  label,
  value,
  delay,
}) => (
  <div
    className="bg-white/20 p-4 rounded-lg text-center animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="text-terracotta text-xl mb-2">{icon}</div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

// === LOADING COMPONENT ===
const LoadingSkeleton = () => (
  <div className="bg-white/80 rounded-xl p-6 shadow-sm animate-fade-in">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-gray-200 rounded-full animate-float"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0.2, 0.3].map((delay) => (
          <div
            key={delay}
            className="animate-fade-in"
            style={{ animationDelay: `${delay}s` }}
          >
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// === MAIN COMPONENT ===
const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  onWeatherUpdate,
}): JSX.Element => {
  const { data: weatherData, error } = useWeather(location);
  const previousDescription = useRef<string>("");

  // === EFFECTS ===
  useEffect(() => {
    if (weatherData?.weather?.[0]?.description) {
      const description = weatherData.weather[0].description
        .toLowerCase()
        .trim();
      if (description !== previousDescription.current) {
        previousDescription.current = description;
        onWeatherUpdate(description);
      }
    }
  }, [weatherData, onWeatherUpdate]);

  // === RENDER CONDITIONS ===
  if (error) {
    return (
      <div
        role="alert"
        className="text-red-500 p-4 bg-red-100 rounded animate-fade-in"
      >
        Error fetching weather data: {error.message}
      </div>
    );
  }

  if (!weatherData) {
    return <LoadingSkeleton />;
  }

  // === DATA EXTRACTION ===
  const { name, main, weather, wind, visibility } = weatherData as WeatherData;

  if (!main?.temp || !main?.humidity || !weather?.[0] || !wind?.speed) {
    return (
      <div
        role="alert"
        className="text-yellow-700 p-4 bg-yellow-100 rounded animate-fade-in"
      >
        Weather data incomplete. Please try again later.
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div
      className="glass p-8 rounded-xl shadow-md hover:shadow-lg 
                transition-all duration-300 animate-fade-in transform hover:scale-[1.01]"
      role="region"
      aria-label="Current Weather Information"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 animate-fade-in">
          Current Weather in {name}
        </h2>
        <p className="text-gray-600 animate-fade-in">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
      </div>

      {/* Main Weather Display */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="animate-float p-4 bg-white/30 rounded-full">
            <WeatherIcon icon={weather[0].icon} size={80} aria-hidden="true" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-6xl font-bold animate-fade-in">
              {Math.round(main.temp)}°F
            </p>
            <p className="text-xl capitalize animate-fade-in mt-1 text-gray-700">
              {weather[0].description}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <FaThermometerHalf />,
            label: "Feels Like",
            value: `${Math.round(main.feels_like)}°F`,
            delay: "0.1s",
          },
          {
            icon: <FaTint />,
            label: "Humidity",
            value: `${main.humidity}%`,
            delay: "0.2s",
          },
          {
            icon: <FaWind />,
            label: "Wind Speed",
            value: `${Math.round(wind.speed)} mph`,
            delay: "0.3s",
          },
          {
            icon: <FaCompass />,
            label: "Visibility",
            value: `${Math.round(visibility / 1000)} km`,
            delay: "0.4s",
          },
        ].map((detail) => (
          <WeatherDetail key={detail.label} {...detail} />
        ))}
      </div>
    </div>
  );
};

export default CurrentWeather;
