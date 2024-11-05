import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  console.log("Received location:", location); // Log the received location

  if (!location) {
    console.log("No location provided");
    return NextResponse.json(
      { error: "Location is required" },
      { status: 400 }
    );
  }

  if (!API_KEY) {
    console.error("OpenWeather API key is not set");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=imperial`;
  console.log("Fetching weather data from:", url); // Log the full URL (remove in production)

  try {
    const response = await fetch(url);
    console.log("Response status:", response.status); // Log the response status

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      console.error("Error details:", errorText);
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Weather data received:", JSON.stringify(data, null, 2)); // Log the received data
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Failed to fetch weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}