import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WeatherMusicSection } from "@/components/layout/WeatherMusicSection";

// Mock child components
jest.mock(
  "@/components/Chat/MoodMixChat",
  () =>
    function MockMoodMixChat() {
      return <div data-testid="mood-mix-chat">Mood Mix Chat</div>;
    }
);

jest.mock(
  "@/components/Weather/CurrentWeather",
  () =>
    function MockCurrentWeather() {
      return <div data-testid="current-weather">Current Weather</div>;
    }
);

jest.mock(
  "@/components/Music/MusicRecommendations",
  () =>
    function MockMusicRecommendations() {
      return (
        <div data-testid="music-recommendations">Music Recommendations</div>
      );
    }
);

jest.mock(
  "@/components/MusicInsightsV2",
  () =>
    function MockMusicInsights() {
      return <div data-testid="music-insights">Music Insights</div>;
    }
);

// Mock Lucide Icons
jest.mock("lucide-react", () => ({
  Music: function MockMusicIcon() {
    return <div>Music Icon</div>;
  },
  MessageSquare: function MockMessageIcon() {
    return <div>Message Icon</div>;
  },
}));

describe("WeatherMusicSection", () => {
  const defaultProps = {
    location: "New York",
    weatherDescription: "sunny",
    moodGenres: ["pop", "rock"],
    selectedGenres: ["pop", "rock"],
    displayTitle: "Test Playlist",
    spotifyAccessToken: "mock-token",
    onMoodAnalysis: jest.fn(),
    onWeatherUpdate: jest.fn(),
    showMusicInsights: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all main components", () => {
    render(<WeatherMusicSection {...defaultProps} />);

    expect(screen.getByTestId("mood-mix-chat")).toBeInTheDocument();
    expect(screen.getByTestId("current-weather")).toBeInTheDocument();
    expect(screen.getByTestId("music-recommendations")).toBeInTheDocument();
  });

  it("shows chat tab by default", () => {
    render(<WeatherMusicSection {...defaultProps} />);

    const chatTab = screen.getByText("Chat");
    expect(chatTab.closest("button")).toHaveClass("border-terracotta");
    expect(screen.getByTestId("mood-mix-chat")).toBeInTheDocument();
  });

  it("switches between chat and insights tabs", () => {
    render(<WeatherMusicSection {...defaultProps} />);

    // Initial state - Chat tab
    expect(screen.getByTestId("mood-mix-chat")).toBeInTheDocument();

    // Click insights tab
    fireEvent.click(screen.getByText("AI Insights"));
    expect(screen.getByTestId("music-insights")).toBeInTheDocument();

    // Click chat tab again
    fireEvent.click(screen.getByText("Chat"));
    expect(screen.getByTestId("mood-mix-chat")).toBeInTheDocument();
  });

  it("hides insights tab when showMusicInsights is false", () => {
    render(<WeatherMusicSection {...defaultProps} showMusicInsights={false} />);

    expect(screen.queryByText("AI Insights")).not.toBeInTheDocument();
  });

  it("updates when weather description changes", () => {
    const mockOnWeatherUpdate = jest.fn();
    const { rerender } = render(
      <WeatherMusicSection
        {...defaultProps}
        onWeatherUpdate={mockOnWeatherUpdate}
      />
    );

    // Rerender with new weather description
    rerender(
      <WeatherMusicSection
        {...defaultProps}
        weatherDescription="rainy"
        onWeatherUpdate={mockOnWeatherUpdate}
      />
    );

    expect(screen.getByTestId("current-weather")).toBeInTheDocument();
  });

  it("displays correct title and location", () => {
    render(<WeatherMusicSection {...defaultProps} />);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByTestId("current-weather")).toBeInTheDocument();
  });
});
