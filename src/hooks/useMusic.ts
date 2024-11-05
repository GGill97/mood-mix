// src/hooks/useMusic.ts
import { useState, useEffect, useRef } from "react";
import { getRecommendations, type SpotifyTrack } from "@/utils/spotifyApi";

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

export function useMusic(genres: string[], accessToken: string | undefined) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const previousGenres = useRef<string[]>([]);

  useEffect(() => {
    // Compare current genres with previous genres
    const genresChanged =
      JSON.stringify(previousGenres.current) !== JSON.stringify(genres);

    if (!accessToken || genres.length === 0 || !genresChanged) return;

    // Update previous genres
    previousGenres.current = genres;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching recommendations for genres:", genres);
        const recommendations = await getRecommendations(accessToken, genres);

        // Log the first track to verify the data structure
        if (recommendations.length > 0) {
          console.log("Sample track data:", recommendations[0]);
        }

        setTracks(
          recommendations.map((track) => ({
            id: track.id,
            name: track.name,
            artists: track.artists,
            uri: track.uri,
            preview_url: track.preview_url,
            external_urls: track.external_urls || {
              spotify: `https://open.spotify.com/track/${track.id}`,
            },
          }))
        );
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [genres, accessToken]);

  return { tracks, error, isLoading };
}
