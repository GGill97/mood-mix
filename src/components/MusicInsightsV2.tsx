import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music, History, CloudRain, Loader2 } from "lucide-react";

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

const MusicInsightsV2 = ({ location, weather, genres }: MusicInsightsProps) => {
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "weather">("history");
  const [lastFetchParams, setLastFetchParams] = useState<string>("");

  const fetchInsights = useCallback(async () => {
    console.log("Starting fetchInsights with:", {
      location,
      weather,
      genres,
      lastFetchParams,
    });

    const currentParams = `${location}-${weather}-${genres.join(",")}`;
    console.log("Checking props in MusicInsightsV2:", {
      location,
      weather,
      genres,
      locationExists: !!location,
      weatherExists: !!weather,
      genresLength: genres.length,
      genresArray: Array.isArray(genres),
    });

    if (!location || !weather || !genres.length) {
      console.log("Props check failed:", {
        locationMissing: !location,
        weatherMissing: !weather,
        genresMissing: !genres.length,
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Making API request to /api/music-insights with:", {
        location,
        weather,
        genres,
      });

      const response = await fetch("/api/music-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, weather, genres }),
      });

      console.log("API Response received:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Success Response:", data);
      setInsights(data);
      setLastFetchParams(currentParams);
    } catch (err) {
      console.error("Error in fetchInsights:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [location, weather, genres, lastFetchParams]);

  useEffect(() => {
    console.log("useEffect triggered with:", {
      location,
      weather,
      genresLength: genres.length,
    });

    if (location && weather && genres.length > 0) {
      console.log("Calling fetchInsights from useEffect");
      fetchInsights();
    }
  }, [fetchInsights]);

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

  const renderContent = () => {
    if (!insights) {
      console.log("No insights available to render");
      return null;
    }

    console.log("Rendering insights:", insights);

    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-terracotta text-terracotta"
                : "border-transparent hover:text-terracotta/70"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Music History</span>
          </button>
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "weather"
                ? "border-terracotta text-terracotta"
                : "border-transparent hover:text-terracotta/70"
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>Weather & Mood</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "history" ? (
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Music className="w-4 h-4" />
                  <span>Local Music History</span>
                </h4>
                <p className="text-gray-700">{insights.historyFact}</p>
              </div>
              {insights.culturalContext && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cultural Context</h4>
                  <p className="text-gray-700">{insights.culturalContext}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <CloudRain className="w-4 h-4" />
                  <span>Weather & Music Analysis</span>
                </h4>
                <p className="text-gray-700">{insights.moodAnalysis}</p>
              </div>
              {insights.weatherImpact && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Weather Impact</h4>
                  <p className="text-gray-700">{insights.weatherImpact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log("MusicInsightsV2 render state:", {
    hasLocation: !!location,
    hasWeather: !!weather,
    genresLength: genres.length,
    isLoading: loading,
    hasError: !!error,
    hasInsights: !!insights,
  });

  if (loading) {
    console.log("Rendering loading state");
    return (
      <Card className="w-full mt-4">
        <CardContent>{renderLoadingState()}</CardContent>
      </Card>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <Card className="w-full mt-4 border-red-200">
        <CardContent>{renderErrorState()}</CardContent>
      </Card>
    );
  }

  if (!location || !weather || !genres.length) {
    console.log("Missing required props, not rendering");
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>AI Music Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default MusicInsightsV2;
