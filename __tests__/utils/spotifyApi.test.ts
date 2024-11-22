import {
  getRecommendations,
  createPlaylist,
  validateSpotifyUrl,
} from "@/utils/spotifyApi";
import { getSession } from "next-auth/react";
import SpotifyWebApi from "spotify-web-api-node";
import {
  mockTrack,
  mockRecommendationsResponse,
  mockPlaylistResponse,
  mockCreatePlaylistResponse,
} from "../../__tests__/mocks/spotifyMocks";
import { mockSpotifySession } from "../../__tests__/mocks/sessionMocks";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  getSession: jest.fn(),
}));

// Mock spotify-web-api-node
jest.mock("spotify-web-api-node");

describe("Spotify API Utils", () => {
  const mockUserId = mockSpotifySession.user.id;
  const mockAccessToken = mockSpotifySession.accessToken;
  let mockSpotifyApi: jest.Mocked<SpotifyWebApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    // Create mock SpotifyApi instance
    mockSpotifyApi = {
      setAccessToken: jest.fn(),
      getRecommendations: jest.fn(),
      getMe: jest.fn(),
      createPlaylist: jest.fn(),
      addTracksToPlaylist: jest.fn(),
      getPlaylist: jest.fn(),
    } as any;

    // Set up the response data
    mockSpotifyApi.getRecommendations.mockResolvedValue(
      mockRecommendationsResponse
    );
    mockSpotifyApi.getMe.mockResolvedValue({ body: { id: mockUserId } });
    mockSpotifyApi.createPlaylist.mockResolvedValue(mockCreatePlaylistResponse);
    mockSpotifyApi.getPlaylist.mockResolvedValue(mockPlaylistResponse);
    mockSpotifyApi.addTracksToPlaylist.mockResolvedValue({ body: {} });

    (SpotifyWebApi as jest.Mock).mockImplementation(() => mockSpotifyApi);
  });

  describe("getRecommendations", () => {
    const mockGenres = ["pop", "rock"];

    it("successfully fetches recommendations", async () => {
      const result = await getRecommendations(mockAccessToken, mockGenres);

      expect(mockSpotifyApi.setAccessToken).toHaveBeenCalledWith(
        mockAccessToken
      );
      expect(mockSpotifyApi.getRecommendations).toHaveBeenCalledWith({
        seed_genres: mockGenres,
        limit: 50,
      });
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockTrack.id,
          name: mockTrack.name,
        })
      );
    });

    it("handles missing access token", async () => {
      await expect(getRecommendations("", mockGenres)).rejects.toThrow(
        "Access token is required for recommendations"
      );
    });

    it("handles API error", async () => {
      const apiError = new Error("API Error");
      mockSpotifyApi.getRecommendations.mockRejectedValueOnce(apiError);

      await expect(
        getRecommendations(mockAccessToken, mockGenres)
      ).rejects.toThrow("API Error");
    });

    it("handles token refresh on 401 error", async () => {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401;

      mockSpotifyApi.getRecommendations
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockRecommendationsResponse);

      (getSession as jest.Mock).mockResolvedValueOnce({
        accessToken: "new-token",
      });

      const result = await getRecommendations(mockAccessToken, mockGenres);
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: mockTrack.id })])
      );
    });
  });

  describe("createPlaylist", () => {
    const mockTracks = ["track1", "track2"];
    const mockPlaylistName = "Test Playlist";

    it("successfully creates a playlist", async () => {
      const result = await createPlaylist(
        mockAccessToken,
        mockUserId,
        mockPlaylistName,
        mockTracks
      );

      expect(result).toEqual({
        id: mockCreatePlaylistResponse.body.id,
        external_urls: mockCreatePlaylistResponse.body.external_urls,
      });
    });

    it("handles validation errors", async () => {
      await expect(
        createPlaylist("", mockUserId, mockPlaylistName, mockTracks)
      ).rejects.toThrow("Access token is required to create a playlist");

      await expect(
        createPlaylist(mockAccessToken, "", mockPlaylistName, mockTracks)
      ).rejects.toThrow("User ID is required to create a playlist");

      await expect(
        createPlaylist(mockAccessToken, mockUserId, mockPlaylistName, [])
      ).rejects.toThrow("At least one track is required to create a playlist");
    });

    it("handles large track lists in batches", async () => {
      const largeMockTracks = Array(150).fill("track-id");

      await createPlaylist(
        mockAccessToken,
        mockUserId,
        mockPlaylistName,
        largeMockTracks
      );

      expect(mockSpotifyApi.addTracksToPlaylist).toHaveBeenCalledTimes(2);
    });
  });

  describe("validateSpotifyUrl", () => {
    it("validates correct Spotify URLs", () => {
      const validUrl = "https://open.spotify.com/track/123";
      expect(validateSpotifyUrl(validUrl)).toBe(validUrl);
    });

    it("rejects invalid URLs", () => {
      expect(() => validateSpotifyUrl("not-a-url")).toThrow(
        "Invalid URL format"
      );
    });

    it("rejects non-Spotify URLs", () => {
      expect(() => validateSpotifyUrl("https://example.com")).toThrow(
        "Invalid URL format"
      );
    });
  });
});
