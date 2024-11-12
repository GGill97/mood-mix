/**
 * useMusicManager.ts
 * Custom hook for managing music-related state like genres and display title
 *
 * Pseudocode:
 * 1. Accept weatherDescription as parameter
 * 2. Initialize states for:
 *    - Selected genres array
 *    - Mood genres array
 *    - Display title
 * 3. Return states and setters
 */

import { useState, useCallback } from "react";

interface MoodAnalysis {
  genres: string[];
  weatherMood: string;
  response: string;
  moodAnalysis: string;
  displayTitle: string;
  shouldRefreshPlaylist?: boolean;
  recommendations?: SpotifyApi.TrackObjectSimplified[];
}

interface MusicManagerReturn {
  // States
  selectedGenres: string[];
  moodGenres: string[];
  displayTitle: string;

  // Setters
  setSelectedGenres: (genres: string[]) => void;
  setMoodGenres: (genres: string[]) => void;
  setDisplayTitle: (title: string) => void;

  // Handlers
  handleMoodAnalysis: (analysis: MoodAnalysis) => void; // Add this
}

export const useMusicManager = (
  weatherDescription: string
): MusicManagerReturn => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [moodGenres, setMoodGenres] = useState<string[]>([]);
  const [displayTitle, setDisplayTitle] = useState<string>("");

  const handleMoodAnalysis = useCallback((analysis: MoodAnalysis) => {
    setMoodGenres(analysis.genres);
    setSelectedGenres(analysis.genres);
    setDisplayTitle(analysis.displayTitle);
  }, []);

  return {
    // States
    selectedGenres,
    moodGenres,
    displayTitle,

    // Setters
    setSelectedGenres,
    setMoodGenres,
    setDisplayTitle,

    // Handlers
    handleMoodAnalysis,
  };
};

export default useMusicManager;
