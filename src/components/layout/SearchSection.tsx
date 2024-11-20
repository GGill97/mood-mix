import React, { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import SearchBar from "../Search/SearchBar";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  onLocationClick: () => void;
  isLoading: boolean;
  error: string | null;
}

export const SearchSection = ({
  onSearch,
  onLocationClick,
  isLoading,
  error,
}: SearchSectionProps) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      await onSearch(query);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto space-y-4">
      <SearchBar onSearch={handleSearch} isLoading={isLoading || isSearching} />

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

      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </section>
  );
};
