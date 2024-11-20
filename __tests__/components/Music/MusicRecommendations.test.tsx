import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MusicRecommendations from "@/components/Music/MusicRecommendations";
import { useSession } from "next-auth/react";
import { useMusic } from "@/hooks/useMusic";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

// Mock custom hook
jest.mock("@/hooks/useMusic", () => ({
  useMusic: jest.fn(),
}));

// Mock React Icons
jest.mock("react-icons/fa", () => ({
  FaSpotify: () => <div data-testid="spotify-icon">Spotify Icon</div>,
  FaPlay: () => <div data-testid="play-icon">Play Icon</div>,
  FaPause: () => <div data-testid="pause-icon">Pause Icon</div>,
  FaSync: () => <div data-testid="sync-icon">Sync Icon</div>,
}));

describe("MusicRecommendations", () => {
  const mockTracks = [
    {
      id: "1",
      name: "Test Track 1",
      artists: [{ name: "Test Artist 1" }],
      uri: "spotify:track:1",
      preview_url: "http://test.com/preview1",
      external_urls: {
        spotify: "http://spotify.com/track/1",
      },
    },
    {
      id: "2",
      name: "Test Track 2",
      artists: [{ name: "Test Artist 2" }],
      uri: "spotify:track:2",
      preview_url: null,
      external_urls: {
        spotify: "http://spotify.com/track/2",
      },
    },
  ];

  const defaultProps = {
    weatherDescription: "sunny",
    moodGenres: ["pop", "rock"],
    displayTitle: "Test Playlist",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: "user1" },
        accessToken: "mock-token",
      },
      status: "authenticated",
    });
    (useMusic as jest.Mock).mockReturnValue({
      tracks: mockTracks,
      error: null,
      isLoading: false,
      refetch: jest.fn(),
      retry: jest.fn(),
    });
  });

  it("renders loading state", () => {
    (useMusic as jest.Mock).mockReturnValue({
      tracks: [],
      error: null,
      isLoading: true,
      refetch: jest.fn(),
      retry: jest.fn(),
    });

    render(<MusicRecommendations {...defaultProps} />);
    expect(screen.getByText(/Loading recommendations/i)).toBeInTheDocument();
  });

  it("renders tracks when loaded", () => {
    render(<MusicRecommendations {...defaultProps} />);

    expect(screen.getByText("Test Track 1")).toBeInTheDocument();
    expect(screen.getByText("Test Artist 1")).toBeInTheDocument();
    expect(screen.getByText("Test Track 2")).toBeInTheDocument();
  });

  it("handles Spotify authentication state", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<MusicRecommendations {...defaultProps} />);
    expect(screen.getByText(/Connect with Spotify/i)).toBeInTheDocument();
  });

  it("shows error state when tracks fail to load", () => {
    (useMusic as jest.Mock).mockReturnValue({
      tracks: [],
      error: "Failed to load tracks",
      isLoading: false,
      refetch: jest.fn(),
      retry: jest.fn(),
    });

    render(<MusicRecommendations {...defaultProps} />);
    expect(
      screen.getByText(/Error loading recommendations/i)
    ).toBeInTheDocument();
  });

  it("shows correct custom title when provided", () => {
    const customTitle = "My Custom Playlist";
    render(
      <MusicRecommendations {...defaultProps} displayTitle={customTitle} />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it("renders Spotify icons for tracks without preview urls", () => {
    render(<MusicRecommendations {...defaultProps} />);

    // Only the second track should show a Spotify icon since it has no preview_url
    const spotifyButtons = screen.getAllByTestId("spotify-icon");
    expect(spotifyButtons.length).toBeGreaterThan(0);
  });
});
