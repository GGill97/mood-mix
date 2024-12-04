// src/utils/spotifyApi.ts
import SpotifyWebApi from "spotify-web-api-node";
import { getSession } from "next-auth/react";

// Types
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyRecommendationsResponse {
  body: {
    tracks: SpotifyTrack[];
  };
}

interface SpotifyPlaylistResponse {
  body: {
    id: string;
    external_urls: {
      spotify: string;
    };
  };
}

interface CreatePlaylistResponse {
  body: {
    id: string;
    external_urls: {
      spotify: string;
    };
  };
}

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.AUTH_REDIRECT_URI,
});

async function withTokenRefresh<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    console.log("Error in operation:", error);
    if (
      error instanceof Error &&
      "statusCode" in error &&
      (error as any).statusCode === 401
    ) {
      console.log("Token expired, attempting refresh...");
      const session = await getSession();
      if (session?.accessToken) {
        console.log("Got new access token, retrying operation...");
        spotifyApi.setAccessToken(session.accessToken);
        return operation();
      }
      throw new Error("Unable to refresh token");
    }
    throw error;
  }
}

export const getRecommendations = async (
  accessToken: string,
  genres: string[]
): Promise<SpotifyTrack[]> => {
  console.log("Starting getRecommendations with:", {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length,
    genres,
  });

  if (!accessToken) {
    throw new Error("Access token is required for recommendations");
  }

  spotifyApi.setAccessToken(accessToken);

  try {
    const data = await withTokenRefresh(async () => {
      console.log("Making Spotify API call for recommendations...");
      const response = await spotifyApi.getRecommendations({
        seed_genres: genres,
        limit: 50,
      });
      console.log("Raw Spotify response:", response);
      return response as SpotifyRecommendationsResponse;
    });
    if (!data.body?.tracks) {
      throw new Error("Invalid response format from Spotify");
    }

    console.log("Recommendations received:", data.body.tracks.length);

    // Map the tracks to ensure all required fields are present
    return data.body.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      uri: track.uri,
      preview_url: track.preview_url,
      external_urls: {
        spotify:
          track.external_urls?.spotify ||
          `https://open.spotify.com/track/${track.id}`,
      },
    }));
  } catch (error) {
    console.error("Detailed error in getRecommendations:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const createPlaylist = async (
  accessToken: string,
  userId: string,
  name: string,
  tracks: string[]
): Promise<CreatePlaylistResponse["body"]> => {
  console.log("Creating playlist with:", {
    userId,
    playlistName: name,
    trackCount: tracks.length,
    firstTrack: tracks[0],
    hasAccessToken: !!accessToken,
  });

  if (!userId) {
    throw new Error("User ID is required to create a playlist");
  }

  if (!accessToken) {
    throw new Error("Access token is required to create a playlist");
  }

  if (!tracks.length) {
    throw new Error("At least one track is required to create a playlist");
  }

  spotifyApi.setAccessToken(accessToken);

  return withTokenRefresh(async () => {
    try {
      // Verify user access
      const userCheck = await spotifyApi.getMe();
      console.log("User verified:", userCheck.body.id);

      // Create the playlist
      const playlistResponse = (await spotifyApi.createPlaylist(userId, {
        name,
        public: true,
        description: "Created by Mood Mix",
      })) as CreatePlaylistResponse;

      console.log("Playlist created:", playlistResponse.body.id);

      // Add tracks in batches
      const batchSize = 100;
      for (let i = 0; i < tracks.length; i += batchSize) {
        const batch = tracks.slice(i, i + batchSize);
        console.log(`Adding batch of ${batch.length} tracks...`);
        await spotifyApi.addTracksToPlaylist(playlistResponse.body.id, batch);
      }

      console.log("All tracks added successfully!");

      // Get the updated playlist to ensure we have the latest data
      const updatedPlaylist = await spotifyApi.getPlaylist(
        playlistResponse.body.id
      );
      return {
        id: updatedPlaylist.body.id,
        external_urls: {
          spotify: updatedPlaylist.body.external_urls.spotify,
        },
      };
    } catch (error) {
      console.error("Detailed error in createPlaylist:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        userId,
        trackCount: tracks.length,
      });
      throw error instanceof Error
        ? error
        : new Error("Failed to create playlist");
    }
  });
};

// Helper function to validate Spotify URLs
export function validateSpotifyUrl(url: string): string {
  try {
    const validUrl = new URL(url);
    if (!validUrl.hostname.includes("spotify.com")) {
      throw new Error("Not a valid Spotify URL");
    }
    return url;
  } catch {
    throw new Error("Invalid URL format");
  }
}

// Export types and utility functions
export type { SpotifyTrack, SpotifyPlaylistResponse, CreatePlaylistResponse };
