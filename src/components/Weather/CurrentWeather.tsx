import { useWeather } from "@/hooks/useWeather";
import WeatherIcon from "./WeatherIcon";
import React from "react";
import { FaThermometerHalf, FaTint, FaWind, FaCompass } from "react-icons/fa";

interface CurrentWeatherProps {
  location: string;
  onWeatherUpdate: (description: string) => void;
}

// Add this helper component
const WeatherDetail = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: string;
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

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  onWeatherUpdate,
}): JSX.Element => {
  const { data: weatherData, error } = useWeather(location);
  // Add useEffect HERE, right after getting the weather data
  React.useEffect(() => {
    if (weatherData?.weather?.[0]?.description) {
      console.log(
        "Updating weather description:",
        weatherData.weather[0].description
      );
      onWeatherUpdate(weatherData.weather[0].description);
    }
  }, [weatherData, onWeatherUpdate]);

  if (error)
    return (
      <div
        role="alert"
        className="text-red-500 p-4 bg-red-100 rounded animate-fade-in"
      >
        Error fetching weather data: {error.message}
      </div>
    );

  if (!weatherData) {
    return (
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
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { name, main, weather, wind, visibility } = weatherData;
  const temp = main?.temp;
  const humidity = main?.humidity;
  const description = weather?.[0]?.description;
  const icon = weather?.[0]?.icon;
  const windSpeed = wind?.speed;
  const feelsLike = main?.feels_like;

  if (!temp || !humidity || !description || !icon || !windSpeed) {
    return (
      <div
        role="alert"
        className="text-yellow-700 p-4 bg-yellow-100 rounded animate-fade-in"
      >
        Weather data incomplete. Please try again later.
      </div>
    );
  }

  return (
    <div
      className="glass p-8 rounded-xl shadow-md hover:shadow-lg 
                 transition-all duration-300 animate-fade-in transform hover:scale-[1.01]"
      role="region"
      aria-label="Current Weather Information"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold mb-2 animate-fade-in"
          id="weather-heading"
        >
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

      {/* Main Weather Info */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="animate-float p-4 bg-white/30 rounded-full">
            <WeatherIcon icon={icon} size={80} aria-hidden="true" />
          </div>
          <div className="text-center md:text-left">
            <p
              className="text-6xl font-bold animate-fade-in"
              aria-label={`Temperature: ${Math.round(temp)} degrees Fahrenheit`}
            >
              {Math.round(temp)}°F
            </p>
            <p
              className="text-xl capitalize animate-fade-in mt-1 text-gray-700"
              aria-label={`Weather condition: ${description}`}
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WeatherDetail
          icon={<FaThermometerHalf />}
          label="Feels Like"
          value={`${Math.round(main.feels_like)}°F`}
          delay="0.1s"
        />
        <WeatherDetail
          icon={<FaTint />}
          label="Humidity"
          value={`${humidity}%`}
          delay="0.2s"
        />
        <WeatherDetail
          icon={<FaWind />}
          label="Wind Speed"
          value={`${Math.round(windSpeed)} mph`}
          delay="0.3s"
        />
        <WeatherDetail
          icon={<FaCompass />}
          label="Visibility"
          value={`${Math.round(visibility / 1000)} km`}
          delay="0.4s"
        />
      </div>
    </div>
  );
};

export default CurrentWeather;
