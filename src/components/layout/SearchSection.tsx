// 2. SearchSection.tsx
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  onLocationClick: () => void;
  isLoading: boolean;
  error: string | null;
}

const SUGGESTED_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Seattle",
  "Miami",
];

export const SearchSection = ({
  onSearch,
  onLocationClick,
  isLoading,
  error,
}: SearchSectionProps) => (
  <section className="w-full max-w-2xl mx-auto space-y-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search for a city..."
        onChange={(e) => onSearch(e.target.value)}
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
          onClick={() => onSearch(city)}
          className="px-4 py-1.5 rounded-full bg-white/30 hover:bg-white/40 
                   transition-colors text-sm font-primary text-soft-brown/80"
        >
          {city}
        </button>
      ))}
    </div>

    <button
      onClick={onLocationClick}
      disabled={isLoading}
      className="w-full mt-2 px-6 py-3 rounded-xl bg-white/80 hover:bg-white/90 
               transition-all duration-300 flex items-center justify-center gap-2 
               text-soft-brown/80 font-primary disabled:opacity-50 
               disabled:cursor-not-allowed"
    >
      <FaMapMarkerAlt className="text-lg" />
      {isLoading ? "Getting location..." : "Use My Location"}
    </button>

    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
  </section>
);
