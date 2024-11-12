/**
 * Main Page Component (page.tsx)
 *
 * Purpose:
 * Acts as the main landing page and orchestrates all core components
 * of the mood-based music recommendation application.
 *
 * Main Functionality:
 * 1. Manages location and weather states
 * 2. Coordinates music mood analysis
 * 3. Controls component visibility based on user interaction
 *
 * Component Flow:
 * - Header: Displays app title
 * - Search: Location input and suggestions
 * - Features: Shows before location is selected
 * - Weather/Music: Shows after location is selected
 *   - Weather display
 *   - Chat interface
 *   - Music recommendations
 *
 * State Management:
 * - Location handling (useLocationManager)
 * - Music preferences (useMusicManager)
 * - Weather conditions
 * - Component visibility
 *
 * External Dependencies:
 * - NextAuth for Spotify authentication
 * - Custom hooks for location and music
 */

"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";

// Components
import { HeaderSection } from "@/components/layout/HeaderSection";
import { SearchSection } from "@/components/layout/SearchSection";
import { FeatureSection } from "@/components/layout/FeatureSection";
import { WeatherMusicSection } from "@/components/layout/WeatherMusicSection";

// Hooks
import { useLocationManager } from "../hooks/useLocationManager";
import { useMusicManager } from "../hooks/useMusicManager";

// Types
interface LocationState {
  city: string;
  error: string | null;
  weather: string;
}

interface MusicState {
  selectedGenres: string[];
  moodGenres: string[];
  displayTitle: string;
}

export default function Home() {
  const { data: session } = useSession();
  const locationManager = useLocationManager();
  const musicManager = useMusicManager(locationManager.weatherDescription);

  const shouldShowFeatures = !locationManager.location;
  const canShowMusicInsights: boolean = Boolean(
    locationManager.location &&
      locationManager.weatherDescription &&
      musicManager.selectedGenres.length > 0
  );
  // Add detailed logging
  console.log("Page.tsx state:", {
    location: locationManager.location,
    weatherDescription: locationManager.weatherDescription,
    selectedGenres: musicManager.selectedGenres,
    canShowMusicInsights,
    moodGenres: musicManager.moodGenres,
  });
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center space-y-12">
      <HeaderSection />

      <SearchSection
        onSearch={locationManager.handleLocationSearch}
        onLocationClick={locationManager.handleLocationClick}
        isLoading={locationManager.isLoading}
        error={locationManager.locationError}
      />

      {shouldShowFeatures ? (
        <FeatureSection />
      ) : (
        <WeatherMusicSection
          location={locationManager.location}
          weatherDescription={locationManager.weatherDescription}
          moodGenres={musicManager.moodGenres}
          selectedGenres={musicManager.selectedGenres}
          displayTitle={musicManager.displayTitle}
          spotifyAccessToken={session?.accessToken}
          onMoodAnalysis={musicManager.handleMoodAnalysis}
          onWeatherUpdate={locationManager.handleWeatherUpdate}
          showMusicInsights={canShowMusicInsights}
        />
      )}
    </main>
  );
}
