import { renderHook, act } from "@testing-library/react";
import { useMusic } from "@/hooks/useMusic";
import { getRecommendations } from "@/utils/spotifyApi";
import type { SpotifyTrack } from "@/utils/spotifyApi";

// Mock the spotifyApi utility
jest.mock("@/utils/spotifyApi", () => ({
  getRecommendations: jest.fn(),
}));

describe("useMusic", () => {
  const mockTrack = {
    id: "track-id-1",
    name: "Test Track",
    artists: [{ name: "Test Artist" }],
    uri: "spotify:track:test-id",
    preview_url: "https://example.com/preview.mp3",
    external_urls: {
      spotify: "https://open.spotify.com/track/test-id",
    },
  };

  const mockRecommendationsResponse = {
    body: {
      tracks: [mockTrack],
    },
  };

  const accessToken = "mock-access-token";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    (getRecommendations as jest.Mock).mockResolvedValue([mockTrack]);
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useMusic([], undefined));
    expect(result.current.tracks).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("uses default genres when empty array is provided", async () => {
    const mockFn = jest.fn().mockImplementation((token, genres) => {
      console.log("getRecommendations called with genres:", genres);
      return Promise.resolve([mockTrack]);
    });

    (getRecommendations as jest.Mock).mockImplementation(mockFn);

    // Start with non-empty array
    const { result, rerender } = renderHook(
      ({ genres, token }) => useMusic(genres, token),
      {
        initialProps: { genres: ["initial"], token: accessToken },
      }
    );

    // Then change to empty array to trigger genres change
    rerender({ genres: [], token: accessToken });

    // Wait for all promises to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check that default genres were used
    expect(mockFn).toHaveBeenCalled();
    const calls = mockFn.mock.calls;
    const defaultGenres = ["pop", "rock", "indie"];

    // Get the last call arguments
    const lastCall = calls[calls.length - 1];
    const [token, calledGenres] = lastCall;

    // Verify the correct arguments were used
    expect(token).toBe(accessToken);
    defaultGenres.forEach((genre) => {
      expect(calledGenres).toContain(genre);
    });
  });

  it("fetches recommendations when genres and token are provided", async () => {
    const genres = ["pop", "rock"];
    (getRecommendations as jest.Mock).mockResolvedValueOnce([mockTrack]);

    const { result } = renderHook(() => useMusic(genres, accessToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getRecommendations).toHaveBeenCalledWith(accessToken, genres);
    expect(result.current.tracks).toEqual([mockTrack]);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it("handles API errors with retry mechanism", async () => {
    const genres = ["pop"];
    const error = new Error("API Error");

    (getRecommendations as jest.Mock)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce([mockTrack]);

    const { result } = renderHook(() => useMusic(genres, accessToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(getRecommendations).toHaveBeenCalledTimes(3);
    expect(result.current.tracks).toEqual([mockTrack]);
    expect(result.current.error).toBeNull();
  });

  it("maintains loading state during fetch operations", async () => {
    const genres = ["pop"];
    (getRecommendations as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve([mockTrack]), 100))
    );

    const { result } = renderHook(() => useMusic(genres, accessToken));

    expect(result.current.isLoading).toBeTruthy();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.tracks).toEqual([mockTrack]);
  });

  it("cleans up state on unmount", async () => {
    const genres = ["pop"];
    let resolvePromise: (value: SpotifyTrack[]) => void;
    const promise = new Promise<SpotifyTrack[]>((resolve) => {
      resolvePromise = resolve;
    });

    (getRecommendations as jest.Mock).mockReturnValue(promise);

    const { unmount, result } = renderHook(() => useMusic(genres, accessToken));

    expect(result.current.isLoading).toBeTruthy();

    unmount();
    resolvePromise!([mockTrack]);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.tracks).toEqual([]);
  });
});
