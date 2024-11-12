/**
 * WeatherMusicSection Component
 *
 * Purpose:
 * - Manages tabbed interface between chat and insights
 * - Controls main layout and content switching
 * - Handles notifications for new insights
 *
 * Flow:
 * 1. User sees chat tab by default
 * 2. After mood analysis, AI Insights tab subtly pulses
 * 3. User can freely switch between tabs
 * 4. Notification clears when insights are viewed
 */

import React, { useState, useEffect } from "react";
import MoodMixChat from "../Chat/MoodMixChat";
import CurrentWeather from "../Weather/CurrentWeather";
import MusicInsightsV2 from "../MusicInsightsV2";
import MusicRecommendations from "../Music/MusicRecommendations";
import { Music, MessageSquare } from "lucide-react";

interface WeatherMusicSectionProps {
  location: string;
  weatherDescription: string;
  moodGenres: string[];
  selectedGenres: string[];
  displayTitle: string;
  spotifyAccessToken?: string;
  onMoodAnalysis: (analysis: any) => void;
  onWeatherUpdate: (description: string) => void;
  showMusicInsights: boolean;
}

export const WeatherMusicSection = ({
  location,
  weatherDescription,
  moodGenres,
  selectedGenres,
  displayTitle,
  spotifyAccessToken,
  onMoodAnalysis,
  onWeatherUpdate,
  showMusicInsights,
}: WeatherMusicSectionProps) => {
  // === STATE MANAGEMENT ===
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");
  const [hasNewInsights, setHasNewInsights] = useState(false);

  // Clear notification when viewing insights
  useEffect(() => {
    if (activeTab === "insights") {
      setHasNewInsights(false);
    }
  }, [activeTab]);

  // Handle new insights after mood analysis
  const handleMoodAnalysis = (analysis: any) => {
    onMoodAnalysis(analysis);
    if (analysis.genres?.length > 0) {
      setHasNewInsights(true);
    }
  };

  // === TAB BUTTON COMPONENT ===
  const TabButton = ({
    id,
    label,
    icon: Icon,
    hasNotification,
  }: {
    id: "chat" | "insights";
    label: string;
    icon: any;
    hasNotification?: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
        ${
          activeTab === id
            ? "bg-white/10 text-terracotta border-b border-terracotta/20"
            : "text-soft-brown/80 hover:bg-white/5"
        }
        ${hasNotification && id === "insights" ? "animate-subtle-pulse" : ""}
      `}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
      {hasNotification && (
        <span className="w-2 h-2 rounded-full bg-terracotta animate-ping opacity-75" />
      )}
    </button>
  );

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Chat and Insights */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <TabButton id="chat" label="Chat" icon={MessageSquare} />
          {showMusicInsights && (
            <TabButton
              id="insights"
              label="AI Insights"
              icon={Music}
              hasNotification={hasNewInsights}
            />
          )}
        </div>

        {/* Content Container */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
          {/* Chat Tab */}
          <div
            className={`
            transition-all duration-300 ease-in-out
            ${activeTab === "chat" ? "block" : "hidden"}
          `}
          >
            <MoodMixChat
              onMoodAnalysis={handleMoodAnalysis}
              className="h-[400px]"
              spotifyAccessToken={spotifyAccessToken}
            />
          </div>

          {/* Insights Tab */}
          <div
            className={`
            transition-all duration-300 ease-in-out
            ${activeTab === "insights" ? "block" : "hidden"}
          `}
          >
            {showMusicInsights && (
              <div className="h-[400px] overflow-y-auto custom-scrollbar">
                <MusicInsightsV2
                  location={location}
                  weather={weatherDescription}
                  genres={selectedGenres}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Weather and Music */}
      <div className="space-y-6">
        <CurrentWeather location={location} onWeatherUpdate={onWeatherUpdate} />
        <MusicRecommendations
          weatherDescription={weatherDescription}
          moodGenres={moodGenres}
          displayTitle={displayTitle}
        />
      </div>
    </div>
  );
};

export default WeatherMusicSection;
