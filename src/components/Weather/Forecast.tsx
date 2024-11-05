import React from "react";
import { useWeather } from "@/hooks/useWeather";
import WeatherIcon from "./WeatherIcon";

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      icon: string;
    }>;
  }>;
}

interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
}

interface ForecastProps {
  location: string;
}

const Forecast: React.FC<ForecastProps> = ({ location }) => {
  const weatherHook = useWeather(location, "forecast");

  if (!weatherHook || typeof weatherHook !== "object") {
    return <div>Error: Unable to fetch forecast data</div>;
  }

  const { data, error } = weatherHook as {
    data: ForecastData | null;
    error: Error | null;
  };

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  const forecastData = data.list
    .reduce((acc: ForecastDay[], curr) => {
      const date = new Date(curr.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (acc.length === 0 || acc[acc.length - 1].date !== date) {
        acc.push({
          date,
          temp: Math.round(curr.main.temp),
          icon: curr.weather[0].icon,
        });
      }
      return acc;
    }, [])
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-5 gap-4">
        {forecastData.map((day, index) => (
          <div key={index} className="text-center">
            <p className="font-semibold">{day.date}</p>
            <WeatherIcon icon={day.icon} size={48} />
            <p>{day.temp}°F</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;
