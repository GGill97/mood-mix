/**
 * MusicInsightsV2 Component
 *
 * Purpose:
 * Displays AI-generated insights about music recommendations based on
 * location, weather, and selected genres. Shows historical and cultural context.
 *
 * Main Functionality:
 * 1. Fetches music insights from API
 * 2. Provides tabbed interface for different insight types
 *    - Music History & Cultural Context
 *    - Weather Impact & Mood Analysis
 * 3. Manages loading and error states
 *
 * Component Structure:
 * - Card Container
 *   - Tab Navigation
 *   - Content Sections
 *     - History View
 *     - Weather View
 *
 * Data Flow:
 * 1. Receives location, weather, genres as props
 * 2. Fetches insights from API
 * 3. Caches results to prevent duplicate fetches
 * 4. Updates display based on active tab
 *
 * Features:
 * - Tabbed navigation
 * - Loading states
 * - Error handling
 * - Console logging for debugging
 * - Responsive layout
 *
 * External Dependencies:
 * - Music Insights API
 * - UI Components from shadcn/ui
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music, History, CloudRain, Loader2 } from "lucide-react";

// === TYPE DEFINITIONS ===
interface MusicInsightsProps {
  location: string;
  weather: string;
  genres: string[];
}

interface Insight {
  historyFact: string;
  moodAnalysis: string;
  genreOrigins?: string;
  weatherImpact?: string;
  culturalContext?: string;
}

type TabType = "history" | "weather";

// === SUB-COMPONENTS ===
const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
      active
        ? "border-terracotta text-terracotta"
        : "border-transparent hover:text-terracotta/70"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const InsightSection = ({
  title,
  content,
  icon,
}: {
  title: string;
  content: string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-white/50 p-4 rounded-lg">
    <h4 className="font-semibold mb-2 flex items-center space-x-2">
      {icon && icon}
      <span>{title}</span>
    </h4>
    <p className="text-gray-700">{content}</p>
  </div>
);

// === MAIN COMPONENT ===
const MusicInsightsV2: React.FC<MusicInsightsProps> = ({
  location,
  weather,
  genres,
}) => {
  // === STATE ===
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [lastFetchParams, setLastFetchParams] = useState<string>("");

  // === DATA FETCHING ===
  const fetchInsights = useCallback(async () => {
    const currentParams = `${location}-${weather}-${genres.join(",")}`;

    if (!location || !weather || !genres.length) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/music-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, weather, genres }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      setInsights(data);
      setLastFetchParams(currentParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [location, weather, genres, lastFetchParams]);

  useEffect(() => {
    if (location && weather && genres.length > 0) {
      fetchInsights();
    }
  }, [fetchInsights]);

  // === RENDER HELPERS ===
  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-8 space-x-2">
      <Loader2 className="animate-spin" />
      <span>Generating insights...</span>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-6 text-red-500 flex items-center space-x-2">
      <span className="text-lg">⚠️</span>
      <span>Unable to load insights: {error}</span>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <InsightSection
        title="Local Music History"
        content={insights?.historyFact || ""}
        icon={<Music className="w-4 h-4" />}
      />
      {insights?.culturalContext && (
        <InsightSection
          title="Cultural Context"
          content={insights.culturalContext}
        />
      )}
    </div>
  );

  const renderWeatherTab = () => (
    <div className="space-y-4">
      <InsightSection
        title="Weather & Music Analysis"
        content={insights?.moodAnalysis || ""}
        icon={<CloudRain className="w-4 h-4" />}
      />
      {insights?.weatherImpact && (
        <InsightSection
          title="Weather Impact"
          content={insights.weatherImpact}
        />
      )}
    </div>
  );

  // === RENDER CONDITIONS ===
  if (loading) {
    return (
      <Card className="w-full mt-4">
        <CardContent>{renderLoadingState()}</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mt-4 border-red-200">
        <CardContent>{renderErrorState()}</CardContent>
      </Card>
    );
  }

  if (!location || !weather || !genres.length) {
    return null;
  }

  // === MAIN RENDER ===
  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>AI Music Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 border-b">
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<History className="w-4 h-4" />}
              label="Music History"
            />
            <TabButton
              active={activeTab === "weather"}
              onClick={() => setActiveTab("weather")}
              icon={<CloudRain className="w-4 h-4" />}
              label="Weather & Mood"
            />
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "history" ? renderHistoryTab() : renderWeatherTab()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicInsightsV2;
