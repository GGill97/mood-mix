// src/components/Weather/WeatherIcon.tsx
import React from "react";

interface WeatherIconProps {
  icon: string;
  size: number;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, size }) => {
  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : `https://openweathermap.org/img/wn/01d@2x.png`; // Default icon

  return (
    <img
      src={iconUrl}
      alt="Weather icon"
      width={size}
      height={size}
      data-testid="weather-icon"
    />
  );
};

export default WeatherIcon;
