// tests/components/Weather/CurrentWeather.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrentWeather from "@/components/Weather/CurrentWeather";

// Mock the useWeather hook
jest.mock("@/hooks/useWeather", () => ({
  useWeather: jest.fn(),
}));

// Mock the WeatherIcon component
jest.mock("@/components/Weather/WeatherIcon", () => ({
  __esModule: true,
  default: () => <div data-testid="weather-icon">Weather Icon</div>,
}));

// Import the mocked hook
import { useWeather } from "@/hooks/useWeather";

describe("CurrentWeather", () => {
  const mockWeatherData = {
    name: "London",
    main: {
      temp: 72,
      feels_like: 70,
      humidity: 65,
    },
    weather: [
      {
        description: "clear sky",
        icon: "01d",
      },
    ],
    wind: {
      speed: 5,
    },
    visibility: 10000,
  };

  const mockOnWeatherUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test loading state
  test("shows loading state when data is loading", () => {
    (useWeather as jest.Mock).mockReturnValue({
      data: null,
      error: null,
    });

    render(
      <CurrentWeather location="London" onWeatherUpdate={mockOnWeatherUpdate} />
    );

    expect(screen.getByText(/Loading weather data/i)).toBeInTheDocument();
  });

  // Test error state
  test("shows error message when there is an error", () => {
    (useWeather as jest.Mock).mockReturnValue({
      data: null,
      error: new Error("Failed to fetch"),
    });

    render(
      <CurrentWeather location="London" onWeatherUpdate={mockOnWeatherUpdate} />
    );

    expect(
      screen.getByText(/Error fetching weather data/i)
    ).toBeInTheDocument();
  });

  // Test successful data display
  test("displays weather data when loaded successfully", () => {
    (useWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      error: null,
    });

    render(
      <CurrentWeather location="London" onWeatherUpdate={mockOnWeatherUpdate} />
    );

    // Check city name
    expect(screen.getByText(/Current Weather in London/i)).toBeInTheDocument();

    // Check temperature
    expect(screen.getByText(/72°F/)).toBeInTheDocument();

    // Check weather description
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();

    // Check weather details
    expect(screen.getByText(/70°F/)).toBeInTheDocument(); // Feels like
    expect(screen.getByText(/65%/)).toBeInTheDocument(); // Humidity
    expect(screen.getByText(/5 mph/)).toBeInTheDocument(); // Wind speed
    expect(screen.getByText(/10 km/)).toBeInTheDocument(); // Visibility
  });

  // Test weather update callback
  test("calls onWeatherUpdate with weather description", () => {
    (useWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      error: null,
    });

    render(
      <CurrentWeather location="London" onWeatherUpdate={mockOnWeatherUpdate} />
    );

    expect(mockOnWeatherUpdate).toHaveBeenCalledWith("clear sky");
  });
});
