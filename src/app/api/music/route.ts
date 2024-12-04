import { NextResponse } from "next/server";
import { getRecommendations } from "@/utils/spotifyApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genres = searchParams.get("genres")?.split(",") || [];
  const accessToken = searchParams.get("accessToken");

  console.log("Music API route accessed:", {
    hasGenres: genres.length > 0,
    hasToken: !!accessToken,
    tokenLength: accessToken?.length,
  });

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }

  if (genres.length === 0) {
    return NextResponse.json(
      { error: "At least one genre is required" },
      { status: 400 }
    );
  }
  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token provided" },
      { status: 401 }
    );
  }

  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?seed_genres=${genres.join(",")}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spotify API error:", {
      status: response.status,
      error: errorText,
      genres
    });
    return NextResponse.json(
      { error: `Spotify API error: ${response.status}` },
      { status: response.status }
    );
  }


  try {
    const recommendations = await getRecommendations(accessToken, genres);

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json(
        { error: "No recommendations found for the given genres" },
        { status: 404 }
      );
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching music recommendations:", error);

    if (error instanceof Error && error.message === "Unable to refresh token") {
      return NextResponse.json(
        { error: "Authentication failed. Please log in again." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch music recommendations" },
      { status: 500 }
    );
  }
}
// Added a check for empty recommendations to provide a more specific error message.
// Enhanced error handling to catch the specific "Unable to refresh token" error, which could occur if the token refresh fails in the spotifyApi utility.
