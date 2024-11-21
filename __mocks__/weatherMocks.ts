// __tests__/mocks/weatherMocks.ts

export const mockWeatherData = {
  name: "Test City",
  main: {
    temp: 72,
    humidity: 65,
    feels_like: 70,
  },
  weather: [
    {
      description: "clear sky",
      icon: "01d",
    },
  ],
  wind: {
    speed: 5.5,
  },
  visibility: 10000,
};

export const mockWeatherError = {
  error: "Failed to fetch weather data",
};

export const mockCoordinates = {
  lat: 37.7749,
  lon: -122.4194,
};

export const mockLocationResponse = {
  cityName: "San Francisco",
  state: "California",
  country: "US",
};
