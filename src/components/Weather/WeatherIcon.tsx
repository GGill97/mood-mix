import React from 'react';

interface WeatherIconProps {
  icon: string;
  size: number;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, size }) => {
  return (
    <img 
      src={`http://openweathermap.org/img/wn/${icon}@2x.png`} 
      alt="Weather icon" 
      width={size} 
      height={size}
    />
  );
};

export default WeatherIcon;