import { useState, useEffect, useRef } from "react";
import { getRecommendations, type SpotifyTrack } from "@/utils/spotifyApi";

// === TYPE DEFINITIONS ===
interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface UseMusic {
  tracks: Track[];
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>; // For manual refresh
  retry: () => Promise<void>; // For error recovery
}

// === CONSTANTS ===
const FETCH_RETRY_LIMIT = 3;
const DEFAULT_GENRES = ["pop", "rock", "indie"];

/**
 * Custom hook for fetching and managing Spotify music recommendations
 * @param genres - Array of music genres to base recommendations on
 * @param accessToken - Spotify access token
 * @returns Object containing tracks, loading state, error state, and control functions
 */
export function useMusic(
  genres: string[],
  accessToken: string | undefined
): UseMusic {
  // === STATE MANAGEMENT ===
  // Track list state
  const [tracks, setTracks] = useState<Track[]>([]);
  // Error handling state
  const [error, setError] = useState<string | null>(null);
  // Loading state for UI feedback
  const [isLoading, setIsLoading] = useState(false);

  // === REFS ===
  // Track previous genres to prevent unnecessary fetches
  const previousGenres = useRef<string[]>([]);
  // Track retry attempts for error recovery
  const retryCount = useRef(0);
  // Keep latest genres in ref for retry/refetch
  const latestGenres = useRef(genres);

  // === HELPER FUNCTIONS ===
  /**
   * Maps Spotify API track data to our internal Track interface
   */
  const mapTrackData = (track: SpotifyTrack): Track => ({
    id: track.id,
    name: track.name,
    artists: track.artists,
    uri: track.uri,
    preview_url: track.preview_url,
    external_urls: track.external_urls || {
      spotify: `https://open.spotify.com/track/${track.id}`,
    },
  });

  /**
   * Core function to fetch recommendations from Spotify
   */
  const fetchRecommendations = async (
    currentGenres: string[],
    currentToken: string
  ): Promise<void> => {
    try {
     
      // Start loading state
      setIsLoading(true);
      setError(null);
      console.log("useMusic fetchRecommendations:", {
        genres: currentGenres,
        hasToken: !!currentToken,
        tokenLength: currentToken?.length,
      });
      const response = await fetch(
        `/api/music?genres=${encodeURIComponent(currentGenres.join(","))}&accessToken=${encodeURIComponent(currentToken)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }
  
      const tracks = await response.json();
      
      if (!tracks || tracks.length === 0) {
        throw new Error('No tracks received from Spotify');
      }
  
      console.log("Tracks received:", {
        count: tracks.length,
        firstTrack: tracks[0]
      });
      

  

  
  
      // Input validation
      if (currentGenres.length === 0) {
        console.warn("No genres provided, using defaults");
        currentGenres = DEFAULT_GENRES;
      }

      console.log("Fetching recommendations for genres:", currentGenres);

      // Get recommendations from Spotify
      const recommendations = await getRecommendations(
        currentToken,
        currentGenres
      );
      console.log("Recommendations received:", {
        count: recommendations.length,
        firstTrack: recommendations[0]
      });

      // Validate response
      if (!recommendations || recommendations.length === 0) {
        throw new Error("No recommendations received from Spotify");
      }

      // Debug logging
      if (recommendations.length > 0) {
        console.log("Sample track data:", recommendations[0]);
      }

      // Process and store tracks
      setTracks(recommendations);

      // Reset retry count on success
      retryCount.current = 0;
    } catch (err) {
      console.error("Error in useMusic:", err);
      

      // Implement retry logic
      if (retryCount.current < FETCH_RETRY_LIMIT) {
        retryCount.current++;
        console.log(`Retrying fetch (attempt ${retryCount.current})...`);
        await fetchRecommendations(currentGenres, currentToken);
        return;
      }

      // Set error if retries exhausted
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Public refetch function for manual refresh
   */
  const refetch = async (): Promise<void> => {
    if (!accessToken || genres.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await getRecommendations(accessToken, genres);
      setTracks(recommendations.map(mapTrackData));
    } catch (err) {
      console.error("Error refreshing recommendations:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh tracks");
    } finally {
      setIsLoading(false);
    }
  };

  // === EFFECTS ===
  // Keep latest genres ref updated
  useEffect(() => {
    latestGenres.current = genres;
  }, [genres]);

  // Main effect for fetching recommendations
  useEffect(() => {
    // Skip if no token or if genres haven't changed
    const genresChanged =
      JSON.stringify(previousGenres.current) !== JSON.stringify(genres);

    if (!accessToken || !genresChanged) return;

    // Update previous genres ref
    previousGenres.current = genres;

    // Fetch new recommendations
    void fetchRecommendations(genres, accessToken);
  }, [genres, accessToken]);

  // === PUBLIC INTERFACE ===
  /**
   * Retry function for error recovery
   */
  const retry = async (): Promise<void> => {
    if (!accessToken) {
      setError("No access token available");
      return;
    }
    retryCount.current = 0;
    await fetchRecommendations(latestGenres.current, accessToken);
  };

  // Return public interface
  return {
    tracks,
    error,
    isLoading,
    refetch,
    retry,
  };
}
