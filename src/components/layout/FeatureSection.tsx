// 3. FeatureSection.tsx
import { FaCloudSun, FaMusic, FaSpotify, FaListUl } from "react-icons/fa";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
  <div className="glass p-6 rounded-xl text-center hover:scale-105 transition-all duration-300">
    <div className="text-3xl text-terracotta mb-3">{icon}</div>
    <h3 className="font-accent text-lg mb-2 text-soft-brown/90">{title}</h3>
    <p className="text-sm text-soft-brown/70 font-primary">{desc}</p>
  </div>
);

export const FeatureSection = () => (
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
);
