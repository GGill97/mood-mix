import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useMusic } from "@/hooks/useMusic";
import MusicRecommendations from "@/components/Music/MusicRecommendations";

// Mock the hooks and modules
jest.mock("next-auth/react");
jest.mock("@/hooks/useMusic");
jest.mock("@/utils/spotifyApi");

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
Object.defineProperty(window.HTMLMediaElement.prototype, "currentTime", {
  writable: true,
  value: 0,
});

describe("MusicRecommendations", () => {
  const mockTracks = [
    {
      id: "1",
      name: "Test Track",
      artists: [{ name: "Test Artist" }],
      uri: "spotify:track:1",
      preview_url: "https://test.com/preview.mp3",
      external_urls: { spotify: "https://open.spotify.com/track/1" },
    },
  ];

  const mockSession = {
    accessToken: "mock-token",
    user: { id: "user-1" },
    expires: "2024",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    (useMusic as jest.Mock).mockReturnValue({
      tracks: mockTracks,
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  // Test 1: Loading State
  it("shows loading state", () => {
    (useMusic as jest.Mock).mockReturnValue({
      isLoading: true,
      tracks: null,
      error: null,
    });

    render(<MusicRecommendations />);
    expect(screen.getByText(/loading recommendations/i)).toBeInTheDocument();
  });

  // Test 2: Authentication Required
  it("shows Spotify connect button when not authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<MusicRecommendations />);
    expect(screen.getByText(/connect with spotify/i)).toBeInTheDocument();
  });

  // Test 3: Error State
  it("shows error message when there is an error", () => {
    (useMusic as jest.Mock).mockReturnValue({
      error: new Error("Test error"),
      tracks: null,
      isLoading: false,
    });

    render(<MusicRecommendations />);
    expect(
      screen.getByText(/error loading recommendations/i)
    ).toBeInTheDocument();
  });

  // Test 4: Track Display
  it("displays track list when data is loaded", () => {
    render(<MusicRecommendations />);
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  // Test 5: Play/Pause Button UI
  it("toggles play/pause button state", () => {
    render(<MusicRecommendations />);
    const playButton = screen.getByLabelText("Play");
    fireEvent.click(playButton);
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  // Test 6: Weather Genre Mapping
  it("maps weather description to genres correctly", () => {
    render(<MusicRecommendations weatherDescription="clear sky" />);
    expect(screen.getByText(/pop.*summer.*dance/i)).toBeInTheDocument();
  });

  // Test 7: Refresh Function
  it("handles playlist refresh", () => {
    const mockRefetch = jest.fn();
    (useMusic as jest.Mock).mockReturnValue({
      tracks: mockTracks,
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MusicRecommendations />);
    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  // Test 8: Playlist Creation
  it("handles playlist creation", async () => {
    const { createPlaylist } = require("@/utils/spotifyApi");
    createPlaylist.mockResolvedValue({
      external_urls: { spotify: "https://spotify.com/playlist/1" },
    });

    render(<MusicRecommendations />);
    const createButton = screen.getByText(/create spotify playlist/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(/playlist created successfully/i)
      ).toBeInTheDocument();
    });
  });

  // Test 9: Custom Title
  it("shows custom display title when provided", () => {
    render(<MusicRecommendations displayTitle="Custom Mix" />);
    expect(screen.getByText("Custom Mix")).toBeInTheDocument();
  });

  // Test 10: Mood Genres
  it("uses provided mood genres instead of weather genres", () => {
    const moodGenres = ["happy", "energetic"];
    render(<MusicRecommendations moodGenres={moodGenres} />);
    expect(useMusic).toHaveBeenCalledWith(moodGenres, mockSession.accessToken);
  });
});
/*
 MusicRecommendations
    ✓ shows loading state (16 ms)
    ✓ shows Spotify connect button when not authenticated (6 ms)
    ✓ shows error message when there is an error (3 ms)
    ✓ displays track list when data is loaded (5 ms)
    ✓ toggles play/pause button state (10 ms)
    ✓ maps weather description to genres correctly (3 ms)
    ✓ handles playlist refresh (4 ms)
    ✓ handles playlist creation (31 ms)
    ✓ shows custom display title when provided (3 ms)
    ✓ uses provided mood genres instead of weather genres (3 ms)
*/
