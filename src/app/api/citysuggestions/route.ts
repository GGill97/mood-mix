import { NextResponse } from "next/server";

// Interface for OpenWeather API response
interface OpenWeatherLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

// Interface for Nominatim API response
interface NominatimLocation {
  address: {
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    country: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // First try OpenWeather API for main cities
    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;
    const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      query
    )}&limit=3&appid=${OPENWEATHER_API_KEY}`;

    const weatherResponse = await fetch(geocodingUrl);
    const weatherResults =
      (await weatherResponse.json()) as OpenWeatherLocation[];

    // Nominatim for more detailed local results
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5`;
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "MoodMix Weather App",
      },
    });
    const nominatimResults =
      (await nominatimResponse.json()) as NominatimLocation[];

    // Combine and format results
    const combinedResults = new Set<string>();

    // Add OpenWeather results
    weatherResults.forEach((result) => {
      const formatted = formatLocation(
        result.name,
        result.state,
        result.country
      );
      combinedResults.add(formatted);
    });

    // Add Nominatim results
    nominatimResults.forEach((result) => {
      const address = result.address;

      // Handle districts/neighborhoods
      if (address.suburb || address.neighbourhood) {
        const district = address.suburb ?? address.neighbourhood ?? "";
        const city = address.city ?? address.town ?? address.municipality ?? "";
        if (city) {
          const formatted = formatDetailedLocation(
            district,
            city,
            address.state ?? "",
            address.country
          );
          combinedResults.add(formatted);
        }
      }

      // Handle cities
      if (address.city || address.town) {
        const formatted = formatLocation(
          address.city ?? address.town ?? "",
          address.state ?? "",
          address.country
        );
        combinedResults.add(formatted);
      }
    });

    // Convert to array and sort by relevance
    const suggestions = Array.from(combinedResults)
      .filter((location) =>
        location.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize results that start with the query
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 6); // Limit to 6 results to avoid overcrowding

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error(
      "City suggestions error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch city suggestions" },
      { status: 500 }
    );
  }
}

function formatLocation(
  city: string,
  state: string | undefined,
  country: string | undefined
): string {
  const parts = [city];
  if (state?.trim()) parts.push(state);
  if (country === "United States of America") parts.push("USA");
  else if (country?.trim()) parts.push(country);
  return parts.join(", ");
}

function formatDetailedLocation(
  district: string,
  city: string,
  state: string | undefined,
  country: string | undefined
): string {
  return `${district} (${city}), ${state ? state + ", " : ""}${
    country === "United States of America" ? "USA" : country ?? ""
  }`
    .replace(/,\s+,/g, ",")
    .replace(/,\s*$/g, "");
}
