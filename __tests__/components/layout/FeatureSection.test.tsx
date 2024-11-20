// tests/components/layout/FeatureSection.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FeatureSection } from "@/components/layout/FeatureSection";

// Mock the react-icons/fa components
jest.mock("react-icons/fa", () => ({
  FaCloudSun: () => <div data-testid="cloud-sun-icon">Cloud Sun Icon</div>,
  FaMusic: () => <div data-testid="music-icon">Music Icon</div>,
  FaSpotify: () => <div data-testid="spotify-icon">Spotify Icon</div>,
  FaListUl: () => <div data-testid="list-icon">List Icon</div>,
}));

describe("FeatureSection", () => {
  // Test basic rendering
  test("renders main section title and description", () => {
    render(<FeatureSection />);

    // Check main title
    expect(
      screen.getByText(/Discover Your Weather-Inspired Playlist/i)
    ).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText(/Enter a city or use your location/i)
    ).toBeInTheDocument();
  });

  // Test feature cards rendering
  test("renders all three feature cards with correct content", () => {
    render(<FeatureSection />);

    // Check feature titles
    expect(screen.getByText("Real-time Weather")).toBeInTheDocument();
    expect(screen.getByText("Spotify Integration")).toBeInTheDocument();
    expect(screen.getByText("Smart Matches")).toBeInTheDocument();

    // Check feature descriptions
    expect(screen.getByText("Accurate local forecasts")).toBeInTheDocument();
    expect(screen.getByText("Curated playlists")).toBeInTheDocument();
    expect(screen.getByText("Weather-matched tracks")).toBeInTheDocument();
  });

  // Test icons rendering
  test("renders all required icons", () => {
    render(<FeatureSection />);

    // Check for icon presence using getAllByTestId
    expect(screen.getAllByTestId("cloud-sun-icon")).toHaveLength(2); // Header and card
    expect(screen.getByTestId("music-icon")).toBeInTheDocument();
    expect(screen.getByTestId("spotify-icon")).toBeInTheDocument();
    expect(screen.getByTestId("list-icon")).toBeInTheDocument();
  });

  // Test styling classes
  test("contains required styling classes", () => {
    const { container } = render(<FeatureSection />);

    // Check for glass effect class on the main container
    const glassContainer = container.querySelector(".glass");
    expect(glassContainer).toHaveClass("p-8", "rounded-xl");

    // Check for grid layout
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toHaveClass("grid-cols-1", "md:grid-cols-3", "gap-6");

    // Check feature cards
    const featureCards = container.querySelectorAll(".glass.p-6");
    expect(featureCards).toHaveLength(3);
    featureCards.forEach((card) => {
      expect(card).toHaveClass(
        "rounded-xl",
        "text-center",
        "hover:scale-105",
        "transition-all",
        "duration-300"
      );
    });
  });
});
