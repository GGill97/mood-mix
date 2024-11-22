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
 * DATA FLOW:
 * 1. Receives location and weather info as props
 * 2. Manages active tab state internally
 * 3. Handles mood analysis callbacks
 * 4. Updates music recommendations based on analysis
 */

import React, { useState, useEffect } from "react";
import { Music, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import MoodMixChat from "../Chat/MoodMixChat";
import CurrentWeather from "../Weather/CurrentWeather";
import MusicInsightsV2 from "../MusicInsightsV2";
import MusicRecommendations from "../Music/MusicRecommendations";
export type { ChatMessage, MoodAnalysis, MoodMixChatProps } from "@/types/chat";
// === TYPE DEFINITIONS ===

// Main component props
interface WeatherMusicSectionProps {
  location: string;
  weatherDescription: string;
  moodGenres: string[];
  selectedGenres: string[];
  displayTitle: string;
  spotifyAccessToken?: string;
  onMoodAnalysis: (analysis: MoodAnalysis) => void;
  onWeatherUpdate: (description: string) => void;
  showMusicInsights: boolean;
}

// Tab button props
interface TabButtonProps {
  label: string;
  icon: React.ComponentType;
  hasNotification?: boolean;
  onClick: () => void;
  isActive: boolean;
}

// === SUB-COMPONENTS ===

/**
 * TabButton Component
 * Renders a single tab button with icon and optional notification
 */
const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon: Icon,
  hasNotification,
  onClick,
  isActive,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
      isActive
        ? "bg-white/10 text-terracotta border-b-2 border-terracotta"
        : "text-soft-brown/80 hover:bg-white/5",
      hasNotification && "animate-subtle-pulse"
    )}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
    {hasNotification && (
      <span className="w-2 h-2 rounded-full bg-terracotta animate-ping opacity-75" />
    )}
  </button>
);

// === MAIN COMPONENT ===
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
  // === STATE MANAGEMENT ===
  // Track active tab (chat or insights)
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");
  // Track if there are new insights to show
  const [hasNewInsights, setHasNewInsights] = useState(false);

  // === EFFECTS ===
  // Clear new insights notification when viewing insights tab
  useEffect(() => {
    if (activeTab === "insights") {
      setHasNewInsights(false);
    }
  }, [activeTab]);

  // === HANDLERS ===
  // Handle mood analysis response
  const handleMoodAnalysis = (analysis: MoodAnalysis) => {
    onMoodAnalysis(analysis);
    // Show notification if we got new genres
    if (analysis.genres?.length > 0) {
      setHasNewInsights(true);
    }
  };

  // === RENDER ===
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Chat/Insights */}
        <div className="flex flex-col">
          {/* Tab Navigation */}
          <div className="mb-4 h-[52px] flex gap-2 items-center">
            <TabButton
              label="Chat"
              icon={MessageSquare}
              onClick={() => setActiveTab("chat")}
              isActive={activeTab === "chat"}
              hasNotification={false}
            />
            {showMusicInsights && (
              <TabButton
                label="AI Insights"
                icon={Music}
                onClick={() => setActiveTab("insights")}
                isActive={activeTab === "insights"}
                hasNotification={hasNewInsights}
              />
            )}
          </div>

          {/* Content Area */}
          <div className="glass rounded-xl overflow-hidden h-[420px]">
            <div className="flex flex-col h-full">
              {/* Chat Tab Content */}
              {activeTab === "chat" && (
                <MoodMixChat
                  onMoodAnalysis={handleMoodAnalysis}
                  spotifyAccessToken={spotifyAccessToken}
                  className="h-full"
                />
              )}
              {/* Insights Tab Content */}
              {showMusicInsights && activeTab === "insights" && (
                <div className="h-full overflow-y-auto custom-scrollbar p-6">
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

        {/* Right Column - Weather */}
        <div className="flex flex-col">
          {/* Spacer for alignment with tabs */}
          <div className="h-[52px] mb-4"></div>
          {/* Weather Display */}
          <div className="glass rounded-xl overflow-hidden h-[420px]">
            <div className="flex flex-col h-full justify-between">
              <div className="p-6">
                <CurrentWeather
                  location={location}
                  onWeatherUpdate={onWeatherUpdate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Bottom - Music Recommendations */}
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
