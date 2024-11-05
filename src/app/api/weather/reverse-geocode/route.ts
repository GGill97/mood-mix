// src/app/api/weather/reverse-geocode/route.ts

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Log environment variable status
    console.log("Environment check:", {
      hasApiKey: !!process.env.NEXT_OPENWEATHER_API_KEY,
      apiKeyLength: process.env.NEXT_OPENWEATHER_API_KEY?.length || 0,
    });

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing latitude or longitude parameters" },
        { status: 400 }
      );
    }

    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;

    if (!OPENWEATHER_API_KEY) {
      console.error(
        "OpenWeather API key is missing. Please check your .env.local file"
      );
      return NextResponse.json(
        { error: "Weather service configuration error" },
        { status: 500 }
      );
    }

    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;

    console.log(
      "Fetching from OpenWeather:",
      geocodeUrl.replace(OPENWEATHER_API_KEY, "API_KEY_HIDDEN")
    );

    const response = await fetch(geocodeUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenWeather response:", data);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No location found for these coordinates" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cityName: data[0].name,
      state: data[0].state,
      country: data[0].country,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to process location data" },
      { status: 500 }
    );
  }
}
