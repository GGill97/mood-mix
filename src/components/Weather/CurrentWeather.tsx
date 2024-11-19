import React, { useEffect, useRef } from "react";
import { useWeather } from "@/hooks/useWeather";
import WeatherIcon from "./WeatherIcon";
import { FaThermometerHalf, FaTint, FaWind, FaCompass } from "react-icons/fa";

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

const WeatherDetail: React.FC<WeatherDetailProps> = ({
  icon,
  label,
  value,
  delay,
}) => (
  <div
    className="bg-white/20 p-3 rounded-lg flex flex-col items-center justify-center h-[100px] animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="text-terracotta mb-1.5">{icon}</div>
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-lg font-medium">{value}</div>
  </div>
);

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  onWeatherUpdate,
}): JSX.Element => {
  const { data: weatherData, error } = useWeather(location);
  const previousDescription = useRef<string>("");

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

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error fetching weather data
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-center">
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  const { name, main, weather, wind, visibility } = weatherData;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Current Weather in {name}</h2>
        <p className="text-gray-600 text-base">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-8">
          <div className="animate-float bg-white/30 p-6 rounded-full">
            <WeatherIcon icon={weather[0].icon} size={64} aria-hidden="true" />
          </div>
          <div>
            <div className="text-6xl font-bold mb-2">
              {Math.round(main.temp)}°F
            </div>
            <div className="text-2xl text-gray-700 capitalize">
              {weather[0].description}
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
        <WeatherDetail
          icon={<FaThermometerHalf size={24} />}
          label="Feels Like"
          value={`${Math.round(main.feels_like)}°F`}
          delay="0.1s"
        />
        <WeatherDetail
          icon={<FaTint size={24} />}
          label="Humidity"
          value={`${main.humidity}%`}
          delay="0.2s"
        />
        <WeatherDetail
          icon={<FaWind size={24} />}
          label="Wind Speed"
          value={`${Math.round(wind.speed)} mph`}
          delay="0.3s"
        />
        <WeatherDetail
          icon={<FaCompass size={24} />}
          label="Visibility"
          value={`${Math.round(visibility / 1000)} km`}
          delay="0.4s"
        />
      </div>
    </div>
  );
};

export default CurrentWeather;
