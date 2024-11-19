/**
 * MusicRecommendations Component
 *
 * Purpose:
 * Displays and manages music recommendations based on weather and mood analysis.
 * Integrates with Spotify for playlist creation and music playback.
 *
 * Main Functionality:
 * 1. Fetches music recommendations based on weather/mood genres
 * 2. Provides audio preview playback
 * 3. Allows playlist creation in Spotify
 * 4. Handles Spotify authentication
 *
 * Component Structure:
 * - TrackItem: Sub-component for individual song display
 *   - Handles audio playback
 *   - Shows track info
 *   - Provides Spotify links
 *
 * - Main Component:
 *   - Manages Spotify session
 *   - Handles playlist creation
 *   - Controls track playback
 *   - Maps weather to music genres
 *
 * State Management:
 * - Tracks currently playing song
 * - Manages playlist creation status
 * - Handles loading and error states
 * - Maintains display title
 *
 * External Dependencies:
 * - Spotify Web API
 * - NextAuth for authentication
 * - Custom useMusic hook for recommendations
 */
// === IMPORTS ===
import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { FaSpotify, FaPlay, FaPause, FaSync } from "react-icons/fa";
import { useMusic } from "@/hooks/useMusic";
import { createPlaylist } from "@/utils/spotifyApi";

interface MusicRecommendationsProps {
  weatherDescription?: string;
  moodGenres?: string[];
  displayTitle?: string;
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  uri: string;
  preview_url: string | null;
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifySession {
  error?: string;
  accessToken?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

type PlaylistStatus = "idle" | "creating" | "success" | "error";

interface TrackItemProps {
  track: Track;
  isCurrentlyPlaying: boolean;
  onPlayPause: (trackId: string) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isCurrentlyPlaying,
  onPlayPause,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isCurrentlyPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
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
          <h3 className="font-medium text-soft-brown">{track.name}</h3>
          <p className="text-sm text-soft-brown/75">
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
                       text-soft-brown group"
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

const WEATHER_GENRE_MAP: Record<string, string[]> = {
  "clear sky": ["pop", "summer", "dance"],
  "broken clouds": ["indie", "rock", "chill"],
  "scattered clouds": ["indie", "alternative", "chill"],
  "few clouds": ["indie", "pop", "chill"],
  "light rain": ["ambient", "rainy-day", "jazz"],
  "moderate rain": ["ambient", "jazz", "blues"],
  "heavy rain": ["ambient", "electronic", "jazz"],
  "overcast clouds": ["indie", "alternative", "atmospheric"],
  default: ["pop", "rock", "indie"],
};

const mapWeatherToGenres = (weather: string): string[] => {
  const normalizedWeather = weather.toLowerCase();
  return WEATHER_GENRE_MAP[normalizedWeather] || WEATHER_GENRE_MAP.default;
};

export default function MusicRecommendations({
  weatherDescription,
  moodGenres,
  displayTitle,
}: MusicRecommendationsProps): JSX.Element {
  const [currentTitle, setCurrentTitle] = useState(displayTitle);
  const [playlistStatus, setPlaylistStatus] = useState<PlaylistStatus>("idle");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );

  const { data: session, status } = useSession();
  const spotifySession = session as unknown as SpotifySession;

  const genres = React.useMemo(() => {
    if (moodGenres?.length) return moodGenres;
    if (weatherDescription) return mapWeatherToGenres(weatherDescription);
    return WEATHER_GENRE_MAP.default;
  }, [moodGenres, weatherDescription]);

  const {
    tracks,
    error,
    isLoading,
    refetch: refetchTracks,
  } = useMusic(genres, spotifySession?.accessToken);

  useEffect(() => {
    if (displayTitle?.trim()) {
      setCurrentTitle(displayTitle);
    }
  }, [displayTitle]);

  useEffect(() => {
    if (spotifySession?.error === "RefreshAccessTokenError") {
      void signIn("spotify");
    }
  }, [spotifySession]);

  useEffect(() => {
    setPlaylistStatus("idle");
    setCurrentlyPlayingId(null);
  }, [weatherDescription, moodGenres]);

  const handlePlayPause = (trackId: string) => {
    setCurrentlyPlayingId((current) => (current === trackId ? null : trackId));
  };

  const handleRefreshPlaylist = async () => {
    setCurrentlyPlayingId(null);
    await refetchTracks();
  };

  const handleCreatePlaylist = async () => {
    if (
      !spotifySession?.accessToken ||
      !spotifySession?.user?.id ||
      !tracks?.length
    ) {
      setPlaylistStatus("error");
      return;
    }

    setPlaylistStatus("creating");
    try {
      const trackUris = tracks.map((track) => track.uri);
      const playlistTitle = moodGenres?.length
        ? `Mood Mix: ${moodGenres.join(", ")}`
        : weatherDescription
        ? `Weather Mix: ${weatherDescription}`
        : "Music Mix";

      const result = await createPlaylist(
        spotifySession.accessToken,
        spotifySession.user.id,
        playlistTitle,
        trackUris
      );

      setPlaylistStatus("success");
      if (result.external_urls?.spotify) {
        window.open(result.external_urls.spotify, "_blank");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      setPlaylistStatus("error");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <p className="text-lg text-soft-brown/70">
            Loading recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (!spotifySession || spotifySession.error === "RefreshAccessTokenError") {
    return (
      <div className="p-6 text-center space-y-4">
        <h3 className="text-xl font-medium text-soft-brown mb-4">
          Connect to Spotify
        </h3>
        <button
          onClick={() => void signIn("spotify")}
          className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 text-soft-brown"
        >
          <FaSpotify className="text-xl" />
          Connect with Spotify
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error loading recommendations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-soft-brown">
        {currentTitle ||
          (weatherDescription
            ? `Weather-Inspired ${mapWeatherToGenres(weatherDescription).join(
                " & "
              )} Music`
            : "Music Recommendations")}
      </h2>

      {tracks?.length ? (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {tracks.map((track: Track) => (
              <TrackItem
                key={track.id}
                track={track}
                isCurrentlyPlaying={currentlyPlayingId === track.id}
                onPlayPause={handlePlayPause}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRefreshPlaylist}
              disabled={isLoading}
              className="btn btn-secondary flex items-center justify-center gap-2 
                       px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 
                       transition-colors text-soft-brown"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => void handleCreatePlaylist()}
              disabled={playlistStatus === "creating"}
              className="flex-1 py-3 flex items-center justify-center gap-2 
                       rounded-xl bg-terracotta/20 hover:bg-terracotta/30 
                       transition-colors disabled:opacity-50 
                       disabled:cursor-not-allowed text-soft-brown"
            >
              <FaSpotify className="text-xl" />
              {playlistStatus === "creating"
                ? "Creating Playlist..."
                : "Create Spotify Playlist"}
            </button>
          </div>

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
        <p className="text-center text-soft-brown/70">
          No recommendations found.
        </p>
      )}
    </div>
  );
}
