// src/__tests__/components/Weather/CurrentWeather.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrentWeather from "@/components/Weather/CurrentWeather";
import { useWeather } from "@/hooks/useWeather";

// Mock the useWeather hook
jest.mock("@/hooks/useWeather");

describe("CurrentWeather", () => {
  // Test 1: Loading State
  it("shows loading skeleton when weather data is loading", () => {
    // Mock the hook to return null data (loading state)
    (useWeather as jest.Mock).mockReturnValue({ data: null, error: null });

    render(<CurrentWeather location="London" onWeatherUpdate={() => {}} />);

    // Check if loading skeleton is shown
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  // Test 2: Error State
  it("shows error message when there is an error", () => {
    // Mock the hook to return an error
    (useWeather as jest.Mock).mockReturnValue({
      data: null,
      error: new Error("Failed to load weather"),
    });

    render(<CurrentWeather location="London" onWeatherUpdate={() => {}} />);

    // Check if error message is shown
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load weather"
    );
  });

  // Test 3: Successful Data Display
  it("displays weather data correctly when loaded", () => {
    // Mock successful weather data
    const mockWeatherData = {
      name: "London",
      main: {
        temp: 72,
        feels_like: 70,
        humidity: 65,
      },
      weather: [
        {
          description: "sunny",
          icon: "01d",
        },
      ],
      wind: {
        speed: 5,
      },
      visibility: 10000,
    };

    (useWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      error: null,
    });

    render(<CurrentWeather location="London" onWeatherUpdate={() => {}} />);

    // Check if main weather data is displayed
    expect(screen.getByText("72°F")).toBeInTheDocument();
    expect(screen.getByText(/sunny/i)).toBeInTheDocument();
    expect(screen.getByText("Current Weather in London")).toBeInTheDocument();
  });

  // Test 4: Weather Details Grid
  it("displays all weather details correctly", () => {
    // Use the same mock data as above
    const mockWeatherData = {
      name: "London",
      main: {
        temp: 72,
        feels_like: 70,
        humidity: 65,
      },
      weather: [
        {
          description: "sunny",
          icon: "01d",
        },
      ],
      wind: {
        speed: 5,
      },
      visibility: 10000,
    };

    (useWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      error: null,
    });

    render(<CurrentWeather location="London" onWeatherUpdate={() => {}} />);

    // Check all weather details are present
    expect(screen.getByText("70°F")).toBeInTheDocument(); // Feels like
    expect(screen.getByText("65%")).toBeInTheDocument(); // Humidity
    expect(screen.getByText("5 mph")).toBeInTheDocument(); // Wind speed
    expect(screen.getByText("10 km")).toBeInTheDocument(); // Visibility
  });

  // Test 5: Callback Function
  it("calls onWeatherUpdate when weather description changes", () => {
    const mockOnWeatherUpdate = jest.fn();

    const mockWeatherData = {
      name: "London",
      main: {
        temp: 72,
        feels_like: 70,
        humidity: 65,
      },
      weather: [
        {
          description: "sunny",
          icon: "01d",
        },
      ],
      wind: {
        speed: 5,
      },
      visibility: 10000,
    };

    (useWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      error: null,
    });

    render(
      <CurrentWeather location="London" onWeatherUpdate={mockOnWeatherUpdate} />
    );

    // Check if callback was called with correct description
    expect(mockOnWeatherUpdate).toHaveBeenCalledWith("sunny");
  });
});
