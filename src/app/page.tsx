"use client";

import { useState } from "react";
import CurrentWeather from "@/components/Weather/CurrentWeather";
import MusicRecommendations from "@/components/Music/MusicRecommendations";
import SearchBar from "@/components/Search/SearchBar";
import useGeolocation from "@/hooks/useGeolocation";
import {
  FaMapMarkerAlt,
  FaCloudSun,
  FaMusic,
  FaSpotify,
  FaListUl,
  FaSearch,
} from "react-icons/fa";
import MusicInsightsV2 from "@/components/MusicInsightsV2";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const SUGGESTED_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Seattle",
  "Miami",
];

export default function Home() {
  const [location, setLocation] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const { isLoading, error: geoError, requestGeolocation } = useGeolocation();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenresUpdate = (genres: string[]) => {
    console.log("handleGenresUpdate called with:", genres);
    setSelectedGenres(genres);
    console.log("Setting genres to:", genres);
    // Log state after update on next render
    setTimeout(() => {
      console.log("Updated selectedGenres:", selectedGenres);
    }, 0);
  };

  const handleLocationClick = async () => {
    console.log("Location button clicked");
    setLocationError(null);
    try {
      const coords = await requestGeolocation();
      console.log("Received coordinates:", coords);

      if (!coords) {
        setLocationError(
          "Unable to get your location. Please try again or enter a city name."
        );
        return;
      }

      const response = await fetch(
        `/api/weather/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`
      );
      console.log("Geocode response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to get location name");
      }

      const data = await response.json();
      console.log("Geocode response data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Setting location to:", data.cityName);
      setLocation(data.cityName);
    } catch (err) {
      console.error("Location error:", err);
      setLocationError(
        "Unable to determine your city. Please try entering it manually."
      );
    }
  };

  const handleSearch = (query: string) => {
    console.log("Search initiated with query:", query);
    setLocationError(null);
    setLocation(query);
  };

  const handleWeatherUpdate = (description: string) => {
    console.log("Weather update received:", description);
    setWeatherDescription(description);
    // Log state after update on next render
    setTimeout(() => {
      console.log("Updated weather state:", {
        weatherDescription,
        location,
        selectedGenres,
      });
    }, 0);
  };

  const renderWeatherAndMusic = () => {
    console.log("renderWeatherAndMusic called with state:", {
      location,
      weatherDescription,
      selectedGenres,
      hasLocation: !!location,
      hasWeather: !!weatherDescription,
      genresLength: selectedGenres.length,
    });

    return (
      <section className="w-full max-w-2xl space-y-6">
        <CurrentWeather
          location={location}
          onWeatherUpdate={handleWeatherUpdate}
        />
        <MusicRecommendations
          weatherDescription={weatherDescription}
          onGenresUpdate={handleGenresUpdate}
        />
        {console.log("Before rendering MusicInsightsV2:", {
          location,
          weatherDescription,
          selectedGenres,
        })}
        <MusicInsightsV2
          location={location}
          weather={weatherDescription}
          genres={selectedGenres}
        />
      </section>
    );
  };

  console.log("Home component render state:", {
    location,
    weatherDescription,
    selectedGenres,
    isLoading,
    hasError: !!locationError || !!geoError,
  });

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center space-y-12">
      {/* Main Heading Section */}
      <header className="text-center space-y-4">
        <h1 className="text-6xl font-display font-medium text-soft-brown/90 tracking-tight">
          Your Weather, Your Beats
        </h1>
        <p className="text-lg font-primary text-soft-brown/70 italic">
          Weather-inspired melodies for your day
        </p>
      </header>

      {/* Search Section */}
      <section className="w-full max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a city..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-12 py-3.5 rounded-xl bg-white/95 font-primary 
            placeholder:text-gray-400 focus:outline-none focus:ring-2 
            focus:ring-terracotta/30 shadow-sm"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleSearch(city)}
              className="px-4 py-1.5 rounded-full bg-white/30 hover:bg-white/40 
              transition-colors text-sm font-primary text-soft-brown/80"
            >
              {city}
            </button>
          ))}
        </div>

        <button
          onClick={handleLocationClick}
          disabled={isLoading}
          className="w-full mt-2 px-6 py-3 rounded-xl bg-white/80 hover:bg-white/90 
          transition-all duration-300 flex items-center justify-center gap-2 
          text-soft-brown/80 font-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaMapMarkerAlt className="text-lg" />
          {isLoading ? "Getting location..." : "Use My Location"}
        </button>

        {(locationError || geoError) && (
          <p className="text-red-500 text-sm text-center mt-2">
            {locationError || geoError}
          </p>
        )}
      </section>

      {/* Feature Cards */}
      {!location && (
        <section className="w-full max-w-4xl">
          <div className="glass p-8 rounded-xl">
            <div className="flex justify-center gap-6 mb-8">
              <FaCloudSun className="text-4xl text-terracotta animate-bounce" />
              <FaMusic className="text-4xl text-terracotta animate-bounce delay-100" />
            </div>
            <h2 className="text-2xl font-display text-soft-brown/90 text-center mb-4">
              Discover Your Weather-Inspired Playlist
            </h2>
            <p className="text-center mb-8 text-soft-brown/70 font-primary">
              Enter a city or use your location to get personalized music
              recommendations based on the current weather.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FaCloudSun />}
                title="Real-time Weather"
                desc="Accurate local forecasts"
              />
              <FeatureCard
                icon={<FaSpotify />}
                title="Spotify Integration"
                desc="Curated playlists"
              />
              <FeatureCard
                icon={<FaListUl />}
                title="Smart Matches"
                desc="Weather-matched tracks"
              />
            </div>
          </div>
        </section>
      )}

      {/* Weather and Music Section */}
      {location && renderWeatherAndMusic()}
    </main>
  );
}

const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
  <div className="glass p-6 rounded-xl text-center hover:scale-105 transition-all duration-300">
    <div className="text-3xl text-terracotta mb-3">{icon}</div>
    <h3 className="font-accent text-lg mb-2 text-soft-brown/90">{title}</h3>
    <p className="text-sm text-soft-brown/70 font-primary">{desc}</p>
  </div>
);
