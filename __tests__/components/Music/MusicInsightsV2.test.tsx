import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MusicInsightsV2 from "@/components/MusicInsightsV2";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Music: ({
    "data-testid": testId,
    className,
  }: {
    "data-testid"?: string;
    className?: string;
  }) => (
    <div data-testid={testId} className={className}>
      Music Icon
    </div>
  ),
  History: () => <div data-testid="history-icon">History Icon</div>,
  CloudRain: () => <div data-testid="cloud-rain-icon">Cloud Rain Icon</div>,
  Loader2: () => <div data-testid="loader-icon">Loader Icon</div>,
}));

describe("MusicInsightsV2", () => {
  const defaultProps = {
    location: "New York",
    weather: "sunny",
    genres: ["pop", "rock"],
  };

  const mockInsightsResponse = {
    historyFact: "New York has a rich music history.",
    moodAnalysis: "Sunny weather pairs well with upbeat pop music.",
    culturalContext: "Rock music has deep roots in NYC.",
    weatherImpact: "Sunny days often inspire happy tunes.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInsightsResponse),
      })
    );
  });

  it("renders loading state initially", () => {
    render(<MusicInsightsV2 {...defaultProps} />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText(/Generating insights/i)).toBeInTheDocument();
  });

  it("renders insights after loading", async () => {
    render(<MusicInsightsV2 {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
    });

    expect(screen.getByText("AI Music Insights")).toBeInTheDocument();
    expect(screen.getByTestId("header-music-icon")).toBeInTheDocument();
    expect(
      screen.getByText(mockInsightsResponse.historyFact)
    ).toBeInTheDocument();
  });

  it("handles tab switching correctly", async () => {
    render(<MusicInsightsV2 {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
    });

    // Click Weather & Mood tab
    fireEvent.click(screen.getByRole("button", { name: /Weather & Mood/i }));
    expect(
      screen.getByText(mockInsightsResponse.moodAnalysis)
    ).toBeInTheDocument();

    // Click Music History tab
    fireEvent.click(screen.getByRole("button", { name: /Music History/i }));
    expect(
      screen.getByText(mockInsightsResponse.historyFact)
    ).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    const mockError = new Error("API Error");
    global.fetch = jest.fn().mockRejectedValue(mockError);

    render(<MusicInsightsV2 {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load insights/i)).toBeInTheDocument();
    });
  });

  it("makes API call with correct parameters", async () => {
    render(<MusicInsightsV2 {...defaultProps} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/music-insights",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultProps),
        })
      );
    });
  });

  it("displays all UI sections correctly", async () => {
    render(<MusicInsightsV2 {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
    });

    // Check header
    expect(screen.getByText("AI Music Insights")).toBeInTheDocument();
    expect(screen.getByTestId("header-music-icon")).toBeInTheDocument();

    // Check navigation
    expect(
      screen.getByRole("button", { name: /Music History/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Weather & Mood/i })
    ).toBeInTheDocument();

    // Check content
    expect(screen.getByText("Local Music History")).toBeInTheDocument();
    expect(
      screen.getByText(mockInsightsResponse.historyFact)
    ).toBeInTheDocument();

    // Check additional sections when available
    if (mockInsightsResponse.culturalContext) {
      expect(screen.getByText("Cultural Context")).toBeInTheDocument();
      expect(
        screen.getByText(mockInsightsResponse.culturalContext)
      ).toBeInTheDocument();
    }
  });
});
