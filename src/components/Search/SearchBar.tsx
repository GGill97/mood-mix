import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import debounce from "lodash/debounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const FREQUENT_CITIES = [
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Chicago, IL, USA",
  "Seattle, WA, USA",
  "Miami, FL, USA",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Debounced suggestion fetching (same as before)
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch(
          `/api/citysuggestions?q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsFetching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length >= 2 && showSuggestions) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }

    return () => {
      fetchSuggestions.cancel();
    };
  }, [query, showSuggestions, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-soft-brown/40 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search for a city..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/90 
                     font-serif text-soft-brown placeholder:text-soft-brown/50 
                     focus:outline-none focus:ring-2 focus:ring-terracotta/30
                     shadow-sm text-lg"
            aria-label="Search locations"
            disabled={isLoading}
          />
          {(isLoading || isFetching) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-terracotta/50 border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute z-10 w-full bg-white/95 border border-soft-brown/10 
                       rounded-lg mt-1 shadow-lg overflow-hidden divide-y divide-soft-brown/5"
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-3 hover:bg-soft-brown/5 cursor-pointer 
                         transition-colors duration-300 flex items-center gap-3"
              >
                <FaMapMarkerAlt className="text-soft-brown/40 text-sm" />
                <span className="font-serif text-soft-brown">{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex flex-wrap justify-center gap-2">
        {FREQUENT_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleSuggestionClick(city)}
            className="px-4 py-1.5 rounded-full bg-white/30 hover:bg-white/40
                     transition-colors text-sm font-serif text-soft-brown/80"
          >
            {city.split(",")[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
