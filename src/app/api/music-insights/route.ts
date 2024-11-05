import OpenAI from "openai";
import { NextResponse } from "next/server";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  console.log("Music insights API route hit");

  try {
    console.log("Parsing request body...");
    const { location, weather, genres } = await req.json();

    console.log("Received request data:", {
      location,
      weather,
      genres,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OpenAI API key in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!location || !weather || !genres?.length) {
      console.error("Missing required fields:", {
        hasLocation: !!location,
        hasWeather: !!weather,
        hasGenres: !!genres?.length,
      });
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    console.log("Creating OpenAI prompt for:", {
      location,
      weather,
      genres: genres.join(", "),
    });

    const prompt = `As a music and cultural expert, provide the following insights about ${location} and its music scene, considering the current weather (${weather}) and selected genres (${genres.join(
      ", "
    )}):

1. A brief interesting fact about the music history or culture of ${location} (2 sentences max)
2. An analysis of why these genres suit the current weather (2 sentences max)
3. Brief cultural context about how these genres relate to ${location}'s music scene (2 sentences max)
4. A note about how ${weather} weather has historically influenced local music (2 sentences max)

Format the response as a JSON object with these keys: 'historyFact', 'moodAnalysis', 'culturalContext', 'weatherImpact'`;

    console.log("Making OpenAI API request...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    console.log("Received OpenAI response");

    if (!completion.choices[0]?.message?.content) {
      console.error("Invalid response from OpenAI - no content in response");
      throw new Error("Invalid response from OpenAI");
    }

    console.log("Parsing OpenAI response...");
    const response = JSON.parse(completion.choices[0].message.content);

    console.log("Successfully parsed response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in music insights API:", error);

    if (error instanceof SyntaxError) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Failed to parse OpenAI response" },
        { status: 500 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Returning error response:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
