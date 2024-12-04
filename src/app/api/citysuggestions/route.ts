import { NextResponse } from "next/server";

export const runtime = "edge";

interface OpenWeatherLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

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

    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;
    const results = await Promise.allSettled([
      // OpenWeather API request
      fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=3&appid=${OPENWEATHER_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      ).then((res) => res.json()),

      // Nominatim request
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: { "User-Agent": "MoodMix Weather App" },
          signal: AbortSignal.timeout(5000),
        }
      ).then((res) => res.json()),
    ]);

    const combinedResults = new Set<string>();

    // Handle OpenWeather results
    if (results[0].status === "fulfilled") {
      const weatherResults = results[0].value as OpenWeatherLocation[];
      weatherResults?.forEach((result) => {
        const formatted = formatLocation(
          result.name,
          result.state,
          result.country
        );
        combinedResults.add(formatted);
      });
    }

    // Handle Nominatim results
    if (results[1].status === "fulfilled") {
      const nominatimResults = results[1].value as NominatimLocation[];
      nominatimResults?.forEach((result) => {
        const address = result.address;

        if (address.suburb || address.neighbourhood) {
          const district = address.suburb ?? address.neighbourhood ?? "";
          const city =
            address.city ?? address.town ?? address.municipality ?? "";
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

        if (address.city || address.town) {
          const formatted = formatLocation(
            address.city ?? address.town ?? "",
            address.state ?? "",
            address.country
          );
          combinedResults.add(formatted);
        }
      });
    }

    // Filter and sort results
    const suggestions = Array.from(combinedResults)
      .filter((location) =>
        location.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 6);

    return NextResponse.json(suggestions);
  } catch (error) {
    // Return empty results instead of error for better UX
    return NextResponse.json([]);
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
