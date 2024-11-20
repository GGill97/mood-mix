// tests/components/Weather/WeatherIcon.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import WeatherIcon from "@/components/Weather/WeatherIcon";
import "@testing-library/jest-dom";

describe("WeatherIcon", () => {
  // Basic rendering test
  test("renders without crashing", () => {
    render(<WeatherIcon icon="01d" size={64} />);
    const img = screen.getByRole("img", { name: /weather/i });
    expect(img).toBeInTheDocument();
  });
});
