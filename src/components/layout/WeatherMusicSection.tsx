/**
 * WeatherMusicSection Component
 *
 * FUNCTIONALITY:
 * 1. Displays weather info and chat interface in a grid layout
 * 2. Manages tab switching between chat and insights
 * 3. Handles notifications for new insights
 * 4. Shows music recommendations based on weather/mood
 *
 * COMPONENT STRUCTURE:
 * - Main Grid Container
 *   |- Left Column
 *      |- Tab Buttons
 *      |- Content Area (Chat/Insights)
 *   |- Right Column
 *      |- Spacer (for tab alignment)
 *      |- Weather Display
 *   |- Full Width Bottom
 *      |- Music Recommendations
 *
 * FLOW:
 * 1. User sees chat tab by default
 * 2. Can switch to AI Insights after analysis
 * 3. Weather display stays constant
 * 4. Music recommendations update based on analysis
 */

import React, { useState, useEffect } from "react";
import { Music, MessageSquare } from "lucide-react";
import MoodMixChat from "../Chat/MoodMixChat";
import CurrentWeather from "../Weather/CurrentWeather";
import MusicInsightsV2 from "../MusicInsightsV2";
import MusicRecommendations from "../Music/MusicRecommendations";

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

interface TabButtonProps {
  id: "chat" | "insights";
  label: string;
  icon: React.ComponentType;
  hasNotification?: boolean;
  onClick: () => void;
  isActive: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  id,
  label,
  icon: Icon,
  hasNotification,
  onClick,
  isActive,
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
      ${
        isActive
          ? "bg-white/10 text-terracotta border-b-2 border-terracotta"
          : "text-soft-brown/80 hover:bg-white/5"
      }
      ${hasNotification ? "animate-subtle-pulse" : ""}
    `}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
    {hasNotification && (
      <span className="w-2 h-2 rounded-full bg-terracotta animate-ping opacity-75" />
    )}
  </button>
);

export const WeatherMusicSection: React.FC<WeatherMusicSectionProps> = ({
  location,
  weatherDescription,
  moodGenres,
  selectedGenres,
  displayTitle,
  spotifyAccessToken,
  onMoodAnalysis,
  onWeatherUpdate,
  showMusicInsights,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");
  const [hasNewInsights, setHasNewInsights] = useState(false);

  useEffect(() => {
    if (activeTab === "insights") {
      setHasNewInsights(false);
    }
  }, [activeTab]);

  const handleMoodAnalysis = (analysis: any) => {
    onMoodAnalysis(analysis);
    if (analysis.genres?.length > 0) {
      setHasNewInsights(true);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Tab Navigation */}
          <div className="h-[52px] flex gap-2 items-center">
            <TabButton
              id="chat"
              label="Chat"
              icon={MessageSquare}
              onClick={() => setActiveTab("chat")}
              isActive={activeTab === "chat"}
            />
            {showMusicInsights && (
              <TabButton
                id="insights"
                label="AI Insights"
                icon={Music}
                onClick={() => setActiveTab("insights")}
                isActive={activeTab === "insights"}
                hasNotification={hasNewInsights}
              />
            )}
          </div>

          {/* Content Box */}
          <div className="glass h-[420px] rounded-xl overflow-hidden">
            {activeTab === "chat" ? (
              <MoodMixChat
                onMoodAnalysis={handleMoodAnalysis}
                spotifyAccessToken={spotifyAccessToken}
                className="h-full"
              />
            ) : (
              showMusicInsights && (
                <div className="h-full overflow-y-auto p-6">
                  <MusicInsightsV2
                    location={location}
                    weather={weatherDescription}
                    genres={selectedGenres}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Spacing to match tab height */}
          <div className="h-[52px]" />

          {/* Weather Box */}
          <div className="glass h-[420px] rounded-xl overflow-hidden">
            <div className="h-full p-6">
              <CurrentWeather
                location={location}
                onWeatherUpdate={onWeatherUpdate}
              />
            </div>
          </div>
        </div>

        {/* Music Recommendations */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl">
            <MusicRecommendations
              weatherDescription={weatherDescription}
              moodGenres={moodGenres}
              displayTitle={displayTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
