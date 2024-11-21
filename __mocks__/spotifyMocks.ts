// __tests__/mocks/spotifyMocks.ts

export const mockTrack = {
  id: "track-id-1",
  name: "Test Track",
  artists: [{ name: "Test Artist" }],
  uri: "spotify:track:test-id",
  preview_url: "https://example.com/preview.mp3",
  external_urls: {
    spotify: "https://open.spotify.com/track/test-id",
  },
};

export const mockRecommendationsResponse = {
  body: {
    tracks: [
      mockTrack,
      {
        id: "track-id-2",
        name: "Another Track",
        artists: [{ name: "Another Artist" }],
        uri: "spotify:track:test-id-2",
        preview_url: "https://example.com/preview2.mp3",
        external_urls: {
          spotify: "https://open.spotify.com/track/test-id-2",
        },
      },
    ],
  },
};

export const mockPlaylistResponse = {
  body: {
    id: "playlist-id-1",
    external_urls: {
      spotify: "https://open.spotify.com/playlist/test-id",
    },
  },
};

export const mockCreatePlaylistResponse = {
  body: {
    id: "new-playlist-id",
    external_urls: {
      spotify: "https://open.spotify.com/playlist/new-test-id",
    },
  },
};
