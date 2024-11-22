/**
 * Chat Component Type Definitions
 *
 * Purpose:
 * Centralized type definitions for the chat and mood analysis functionality
 */

// Basic chat message structure
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Mood analysis response structure
export interface MoodAnalysis {
  genres: string[];
  weatherMood: string;
  response: string;
  moodAnalysis: string;
  displayTitle: string;
  shouldRefreshPlaylist?: boolean;
  recommendations?: Array<{
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    uri: string;
    preview_url: string | null;
    external_urls: {
      spotify: string;
    };
  }>;
}

// Chat component props
export interface MoodMixChatProps {
  onMoodAnalysis: (analysis: MoodAnalysis) => void;
  className?: string;
  spotifyAccessToken?: string;
  isMinimized?: boolean;
  onExpand?: () => void;
}


