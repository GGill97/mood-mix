import { NextRequest, NextResponse } from "next/server";

// Add dynamic route marker
export const dynamic = "force-dynamic";
export const runtime = "edge";

// Add type declaration for NextRequest
declare type NextRequestType = NextRequest;

export async function GET(request: NextRequestType) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");

    console.log("Weather API request for location:", location);

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 }
      );
    }

    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;
    if (!OPENWEATHER_API_KEY) {
      console.error("OpenWeather API key is missing");
      return NextResponse.json(
        { error: "Weather service configuration error" },
        { status: 500 }
      );
    }

    // Clean up the location string
    const cleanLocation = location.trim().replace(/\s+/g, " ");
    const encodedLocation = encodeURIComponent(cleanLocation);

    console.log("Fetching coordinates for location:", cleanLocation);

    // Get coordinates
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodedLocation}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      const geoError = await geoResponse.text();
      console.error("Geocoding API error:", geoError);
      throw new Error(`Geocoding failed: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    console.log("Geocoding response:", geoData);

    if (!geoData || geoData.length === 0) {
      console.error("Location not found:", cleanLocation);
      return NextResponse.json(
        { error: "Location not found. Please try a different search term." },
        { status: 404 }
      );
    }

    // Get weather data
    const { lat, lon } = geoData[0];
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`;

    console.log("Fetching weather data for coordinates:", { lat, lon });

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      const weatherError = await weatherResponse.text();
      console.error("Weather API error:", weatherError);
      throw new Error(`Weather API failed: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log("Weather data retrieved successfully");

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch weather data. Please try again or check the location name.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
