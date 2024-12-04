import { NextResponse } from "next/server";

export const runtime = "edge";

interface OpenWeatherGeoResponse {
  name: string;
  state?: string;
  country: string;
}

export async function GET(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Weather service configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`,
      {
        signal: AbortSignal.timeout(5000), // 5 second timeout
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenWeatherGeoResponse[];

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No location found for these coordinates" },
        { status: 404 }
      );
    }

    // Implement fallback values for missing data
    const result = {
      cityName: data[0].name || "Unknown Location",
      state: data[0].state || undefined,
      country: data[0].country || "Unknown Country",
    };

    return NextResponse.json(result);
  } catch (error) {
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes("timeout")) {
      return NextResponse.json({ error: "Request timed out" }, { status: 408 });
    }

    if (
      error instanceof Error &&
      error.message.includes("OpenWeather API error")
    ) {
      return NextResponse.json(
        { error: "Weather service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process location data" },
      { status: 500 }
    );
  }
}
