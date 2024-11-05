import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { FaSpotify, FaPlay, FaPause } from "react-icons/fa";
import { useMusic } from "@/hooks/useMusic";
import { createPlaylist } from "@/utils/spotifyApi";
import type { Session } from "next-auth";
import type { JSX } from "react";

// Props and Types
interface MusicRecommendationsProps {
  weatherDescription: string;
  onGenresUpdate?: (genres: string[]) => void;
}

interface Artist {
  name: string;
}

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  uri: string;
  preview_url: string | null;
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifySession extends Session {
  error?: string;
  accessToken?: string;
  user?: {
    id: string;
  } & Session["user"];
}

type PlaylistStatus = "idle" | "creating" | "success" | "error";

const TrackItem: React.FC<{
  track: Track;
  isCurrentlyPlaying: boolean;
  onPlayPause: (trackId: string) => void;
}> = ({ track, isCurrentlyPlaying, onPlayPause }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isCurrentlyPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isCurrentlyPlaying]);

  const handleSpotifyClick = () => {
    const spotifyUrl =
      track.external_urls?.spotify ||
      `https://open.spotify.com/track/${track.id}`;
    window.open(spotifyUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{track.name}</h3>
          <p className="text-sm opacity-75">
            {track.artists.map((artist) => artist.name).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {track.preview_url ? (
            <button
              onClick={() => onPlayPause(track.id)}
              className="p-2 rounded-full bg-terracotta/20 hover:bg-terracotta/30 
                       transition-colors flex items-center justify-center"
              aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
            >
              {isCurrentlyPlaying ? <FaPause /> : <FaPlay />}
            </button>
          ) : (
            <button
              onClick={handleSpotifyClick}
              className="p-2 rounded-full bg-terracotta/20 hover:bg-terracotta/30 
                       transition-colors flex items-center justify-center 
                       text-soft-brown/80 group"
              title="Listen on Spotify"
            >
              <FaSpotify className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
      {track.preview_url && (
        <audio
          ref={audioRef}
          src={track.preview_url}
          onEnded={() => onPlayPause(track.id)}
          preload="none"
          className="hidden"
        />
      )}
    </div>
  );
};

// Main Component
export default function MusicRecommendations({
  weatherDescription,
  onGenresUpdate,
}: MusicRecommendationsProps): JSX.Element {
  console.log("MusicRecommendations received weather:", weatherDescription);
  const { data: session, status } = useSession();
  const spotifySession = session as SpotifySession;
  const genres = weatherDescription
    ? mapWeatherToGenres(weatherDescription)
    : ["pop", "rock", "indie"];
  console.log("Mapped to genres:", genres);
  const { tracks, error, isLoading } = useMusic(
    genres,
    spotifySession?.accessToken
  );
  const [playlistStatus, setPlaylistStatus] = useState<PlaylistStatus>("idle");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const previousGenres = useRef(genres);
  useEffect(() => {
    if (
      onGenresUpdate &&
      JSON.stringify(previousGenres.current) !== JSON.stringify(genres)
    ) {
      console.log("Weather description:", weatherDescription);
      console.log("Previous genres:", previousGenres.current);
      console.log("New genres:", genres);

      previousGenres.current = genres;
      onGenresUpdate(genres);
    }
  }, [genres, onGenresUpdate, weatherDescription]);

  useEffect(() => {
    if (spotifySession?.error === "RefreshAccessTokenError") {
      void signIn("spotify");
    }
  }, [spotifySession]);

  useEffect(() => {
    setPlaylistStatus("idle");
    setCurrentlyPlayingId(null); // Stop any playing audio when weather changes
  }, [weatherDescription]);

  const handlePlayPause = (trackId: string) => {
    setCurrentlyPlayingId((current) => (current === trackId ? null : trackId));
  };

  const handleCreatePlaylist = async (): Promise<void> => {
    console.log("Starting playlist creation...");
    console.log("Session:", {
      hasAccessToken: !!spotifySession?.accessToken,
      hasUserId: !!spotifySession?.user?.id,
      tracksLength: tracks?.length,
    });

    if (!spotifySession?.accessToken) {
      console.error("No access token found");
      setPlaylistStatus("error");
      return;
    }

    if (!spotifySession?.user?.id) {
      console.error("No user ID found");
      setPlaylistStatus("error");
      return;
    }

    if (!tracks?.length) {
      console.error("No tracks found");
      setPlaylistStatus("error");
      return;
    }

    setPlaylistStatus("creating");
    try {
      console.log("Preparing to create playlist...");
      const trackUris = tracks.map((track: Track) => {
        console.log("Processing track:", track.name, "URI:", track.uri);
        return track.uri;
      });

      const result = await createPlaylist(
        spotifySession.accessToken,
        spotifySession.user.id,
        `Weather Mix: ${weatherDescription}`,
        trackUris
      );

      console.log("Playlist creation result:", result);
      setPlaylistStatus("success");

      // Open the playlist in Spotify
      if (result.external_urls?.spotify) {
        window.open(result.external_urls.spotify, "_blank");
      }
    } catch (err) {
      console.error("Error creating playlist:", err);
      setPlaylistStatus("error");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="glass p-6 rounded-xl text-center">
        <div className="animate-pulse">
          <p className="text-lg text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!spotifySession || spotifySession.error === "RefreshAccessTokenError") {
    return (
      <div className="glass p-6 rounded-xl text-center space-y-4">
        <h3 className="text-xl font-medium mb-4">Connect to Spotify</h3>
        <button
          onClick={() => void signIn("spotify")}
          className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
          type="button"
        >
          <FaSpotify className="text-xl" />
          Connect with Spotify
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-xl text-center text-red-500">
        <p>Error loading recommendations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">
        Music Recommendations for {weatherDescription}
      </h2>

      {tracks && tracks.length > 0 ? (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {tracks.map((track: Track) => (
              <TrackItem
                key={track.id}
                track={track}
                isCurrentlyPlaying={currentlyPlayingId === track.id}
                onPlayPause={handlePlayPause}
              />
            ))}
          </div>

          <button
            onClick={() => void handleCreatePlaylist()}
            disabled={playlistStatus === "creating"}
            type="button"
            className={`btn btn-primary w-full py-3 flex items-center justify-center gap-2
                      ${
                        playlistStatus === "creating"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
          >
            <FaSpotify className="text-xl" />
            {playlistStatus === "creating"
              ? "Creating Playlist..."
              : "Create Spotify Playlist"}
          </button>

          {playlistStatus === "success" && (
            <p className="text-green-500 text-center mt-2">
              ✨ Playlist created successfully! Check your Spotify.
            </p>
          )}

          {playlistStatus === "error" && (
            <p className="text-red-500 text-center mt-2">
              Failed to create playlist. Please try again.
            </p>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          No recommendations found for this weather.
        </p>
      )}
    </div>
  );
}

// Helper function for mapping weather to music genres
const mapWeatherToGenres = (weather: string): string[] => {
  console.log("Mapping weather to genres:", weather);
  const normalizedWeather = weather.toLowerCase();

  const genreMap: Record<string, string[]> = {
    "clear sky": ["pop", "summer", "dance"],
    "broken clouds": ["indie", "rock", "chill"],
    "scattered clouds": ["indie", "alternative", "chill"],
    "few clouds": ["indie", "pop", "chill"],
    "light rain": ["ambient", "rainy-day", "jazz"],
    "moderate rain": ["ambient", "jazz", "blues"],
    "heavy rain": ["ambient", "electronic", "jazz"],
    "overcast clouds": ["indie", "alternative", "atmospheric"],
    "default": ["pop", "rock", "indie"],
  };

  // Fix: use normalizedWeather and "default" (not Default)
  const mappedGenres = genreMap[normalizedWeather] || genreMap["default"];
  console.log("Mapped genres:", mappedGenres);
  return mappedGenres;
};
