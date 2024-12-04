// tests/integration/chatMusic.test.tsx
import {
  render,
  screen,
  waitFor,
  mockMoodAnalysis,
  mockChatMessage,
  generateMockTrack,
} from "../test-utils";
import { WeatherMusicSection } from "@/components/layout/WeatherMusicSection";

jest.mock("@/components/Chat/MoodMixChat", () => ({
  __esModule: true,
  default: ({
    onMoodAnalysis,
  }: {
    onMoodAnalysis: (analysis: any) => void;
  }) => {
    return (
      <div data-testid="mock-chat">
        <button
          onClick={() => onMoodAnalysis(mockMoodAnalysis)}
          data-testid="trigger-analysis"
        >
          Analyze Mood
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/Music/MusicRecommendations", () => ({
  __esModule: true,
  default: ({
    moodGenres,
    weatherDescription,
  }: {
    moodGenres: string[];
    weatherDescription: string;
  }) => (
    <div data-testid="music-recommendations">
      <div data-testid="mood-genres">{moodGenres.join(",")}</div>
      <div data-testid="weather-desc">{weatherDescription}</div>
    </div>
  ),
}));

describe("Chat and Music Integration", () => {
  const defaultProps = {
    location: "London",
    weatherDescription: "Sunny",
    moodGenres: [],
    selectedGenres: [],
    displayTitle: "Your Mix",
    spotifyAccessToken: "mock-token",
    onMoodAnalysis: jest.fn(),
    onWeatherUpdate: jest.fn(),
    showMusicInsights: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates music recommendations when mood analysis is performed", async () => {
    const onMoodAnalysis = jest.fn();

    render(
      <WeatherMusicSection {...defaultProps} onMoodAnalysis={onMoodAnalysis} />
    );

    // Trigger mood analysis from chat
    const analyzeButton = screen.getByTestId("trigger-analysis");
    analyzeButton.click();

    // Verify mood analysis callback was called
    await waitFor(() => {
      expect(onMoodAnalysis).toHaveBeenCalledWith(mockMoodAnalysis);
    });
  });

  it("shows music insights tab after mood analysis", async () => {
    render(<WeatherMusicSection {...defaultProps} />);

    // Click analyze button
    const analyzeButton = screen.getByTestId("trigger-analysis");
    analyzeButton.click();

    // Switch to insights tab
    const insightsTab = screen.getByText(/AI Insights/i);
    insightsTab.click();

    // Verify insights are shown
    await waitFor(() => {
      expect(screen.getByTestId("music-recommendations")).toBeInTheDocument();
    });
  });

  it("integrates weather description with music recommendations", async () => {
    render(
      <WeatherMusicSection
        {...defaultProps}
        weatherDescription="Rainy"
        moodGenres={["chill", "acoustic"]}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("weather-desc")).toHaveTextContent("Rainy");
      expect(screen.getByTestId("mood-genres")).toHaveTextContent(
        "chill,acoustic"
      );
    });
  });
});
