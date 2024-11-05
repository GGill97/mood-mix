import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Seattle",
  "San Francisco",
  "Austin",
  "Denver",
  "Washington",
  "Boston",
  "Miami",
  "Atlanta",
  "Las Vegas",
  "Portland",
];

const FREQUENT_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Seattle",
  "Miami",
];
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 1 && showSuggestions) {
      console.log("Filtering cities for query:", query); // Log when filtering cities
      const filteredCities = CITIES.filter((city) =>
        city.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredCities.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query, showSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with query:", query); // Log form submission
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log("Suggestion clicked:", suggestion); // Log suggestion clicks
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Input value changed to:", value); // Log input changes
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    console.log("Input focused"); // Log focus events
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    console.log("Input blurred"); // Log blur events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-2">
      {" "}
      {/* Added wrapper div with spacing */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 rounded-lg bg-white/90 font-primary text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
      {/* Frequent cities */}
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        {FREQUENT_CITIES.map((city, index) => (
          <button
            key={city}
            onClick={() => handleSuggestionClick(city)}
            className="px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 
                     transition-all duration-300 text-gray-700 hover:text-gray-900
                     animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
