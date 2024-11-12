/**
 * Chat Component Type Definitions
 * 
 * Purpose:
 * Centralized type definitions for the chat and mood analysis functionality
 * 
 * Types:
 * - ChatMessage: Structure of chat messages
 * - MoodAnalysis: Structure of mood analysis response
 * - MoodMixChatProps: Component props interface
 */

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }
  
  export interface MoodAnalysis {
    genres: string[];
    weatherMood: string;
    response: string;
    moodAnalysis?: string;
    recommendations?: SpotifyApi.TrackObjectSimplified[];
  }
  
  export interface MoodMixChatProps {
    onMoodAnalysis: (analysis: MoodAnalysis) => void;
    className?: string;
    spotifyAccessToken?: string;
    isMinimized?: boolean;
    onExpand?: () => void;
  }

  