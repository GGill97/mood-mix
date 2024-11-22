// src/app/api/chat/analyze-mood/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getRecommendations } from "@/utils/spotifyApi";

// Define valid genres as string literal type
// === TYPE DEFINITION ===
type SpotifyGenre =
  | "pop"
  | "dance"
  | "hip-hop"
  | "party"
  | "electronic"
  | "happy"
  | "energetic"
  | "upbeat"
  | "summer"
  // Add new mood-based genres
  | "chill"
  | "acoustic"
  | "sad"
  | "ambient"
  | "melancholic"
  | "jazz"
  | "indie";

// === ADD NEW HELPER FUNCTION ===
const MOOD_ATTRIBUTES: Record<
  string,
  {
    energy: number;
    valence: number;
    tempo: number;
    danceability: number;
  }
> = {
  sad: {
    energy: 0.3,
    valence: 0.2,
    tempo: 80,
    danceability: 0.4,
  },
  relaxed: {
    energy: 0.4,
    valence: 0.6,
    tempo: 95,
    danceability: 0.5,
  },
  happy: {
    energy: 0.8,
    valence: 0.8,
    tempo: 120,
    danceability: 0.7,
  },
};

interface ConversationContext {
  playlistGenerated: boolean;
  lastResponse: string;
  userPreferences: {
    location?: string;
    activity?: string;
    mood?: string;
    preferredGenres?: SpotifyGenre[];
    memory: ConversationMemory;
  };
  currentPlaylist?: {
    genres: SpotifyGenre[];
    displayTitle: string;
    createdAt?: string;
  };
}

interface ConversationMemory {
  hasDeclinedRefresh: boolean;
  lastMessage: string;
  messageCount: number;
  currentTopic?: string;
  briefResponse: boolean;
  lastMeaningfulResponse: string;
}

interface MoodAnalysisResponse {
  genres: SpotifyGenre[];
  weatherMood: (typeof WEATHER_MOODS)[number];
  response: string;
  moodAnalysis: string;
  displayTitle: string;
  targetAttributes: {
    energy: number;
    valence: number;
    tempo: number;
    danceability: number;
  };
  conversationContext?: ConversationContext;
  recommendations?: SpotifyTrack[];
}

interface Analysis {
  wantsNewPlaylist: boolean;
  shouldRespond: boolean;
  response: string;
  moodAnalysis: string;
}

const NEGATIVE_SIGNALS = [
  "no need",
  "i am ok",
  "i'm ok",
  "no thanks",
  "stop",
  "dont change",
  "don't change",
  "no thank you",
  "please don't",
];
const POSITIVE_SIGNALS = [
  "refresh",
  "new songs",
  "differnt",
  "change",
  "something else",
  "another playlist",
  "change it please",
];
function analyzeUserIntent(
  message: string,
  context?: ConversationContext
): {
  wantsNewPlaylist: boolean;
  shouldRespond: boolean;
} {
  const lowerMessage = message.toLowerCase();

  // Check for explicit negative signals
  const hasNegativeSignal = NEGATIVE_SIGNALS.some((signal) =>
    lowerMessage.includes(signal)
  );

  // Check for explicit positive signals
  const hasPositiveSignal = POSITIVE_SIGNALS.some((signal) =>
    lowerMessage.includes(signal)
  );

  // If user has already gotten a playlist and hasn't asked for changes, don't refresh
  const hasExistingPlaylist = context?.playlistGenerated ?? false;
  return {
    wantsNewPlaylist:
      hasPositiveSignal || (!hasExistingPlaylist && !hasNegativeSignal),
    shouldRespond: true,
  };
}

function generateConversationalResponse(
  analysis: Analysis,
  context?: ConversationContext
): string {
  if (!analysis.wantsNewPlaylist && context?.playlistGenerated) {
    // Acknowledge user's preference to keep current playlist
    return `Got it, I'll keep the current playlist playing. Let me know if you want to try something different later!`;
  }
  // Avoid repetitive offers to refresh
  if (context?.lastResponse?.includes("refresh")) {
    return analysis.response.replace(
      /Would you like me to refresh.*$/,
      "Enjoy the music!"
    );
  }

  return analysis.response;
}

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WEATHER_MOODS = [
  "clear sky",
  "broken clouds",
  "scattered clouds",
  "few clouds",
  "light rain",
  "moderate rain",
  "heavy rain",
  "overcast clouds",
] as const;

// === UPDATE GENRES ARRAY ===
const SPOTIFY_GENRES: SpotifyGenre[] = [
  // Existing genres
  "pop",
  "dance",
  "hip-hop",
  "party",
  "electronic",
  "happy",
  "energetic",
  "upbeat",
  "summer",
  "chill",
  "acoustic",
  "sad",
  "ambient",
  "melancholic",
  "jazz",
  "indie",
];

function isValidSpotifyGenre(genre: string): genre is SpotifyGenre {
  return SPOTIFY_GENRES.includes(genre as SpotifyGenre);
}
export async function POST(req: Request) {
  try {
    const { message, context, accessToken } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    // Analyze user intent first
    const userIntent = analyzeUserIntent(message, context);

    if (!userIntent.wantsNewPlaylist && context?.currentPlaylist) {
      return NextResponse.json({
        ...context.currentPlaylist,
        response: generateConversationalResponse(
          {
            wantsNewPlaylist: false,
            shouldRespond: true,
            response: context.currentPlaylist.displayTitle,
            moodAnalysis:
              context.userPreferences?.mood || "Keeping current mood",
          },
          context
        ),
        shouldRefreshPlaylist: false,
        conversationContext: {
          ...context,
          lastResponse: message,
        },
      });
    }

    // === UPDATE PROMPT ===
    const prompt = `As a music expert and conversational AI, analyze this message: "${message}". Previous context:${
      context ? JSON.stringify(context) : "No previous context"
    }
    Focus on having a natural conversation while providing music recommendations.
    - If the user seems satisfied, don't push for changes
    - Acknowledge their current activity and mood
    - Only offer to refresh if they seem unsatisfied
    

Your task is to understand and respect the user's specific mood and music preferences.
If they request sad or slow music, don't try to change their mood - provide appropriate recommendations.

Available genres: ${SPOTIFY_GENRES.join(", ")}

User's message: "${message}"
Previous context: ${context ? JSON.stringify(context) : "No previous context"}

Based on the user's mood and context, determine:
1. The most fitting musical genres that MATCH their requested mood (don't try to change it)
2. A weather description that reflects their emotional state
3. An empathetic response that acknowledges their mood
4. A descriptive title that combines the mood/activity with the recommended genres

Provide your response in this JSON format:
{
  "genres": ["genre1", "genre2"],
  "seedTracks": [],
  "weatherMood": "clear sky",
  "response": "your empathetic response",
  "moodAnalysis": "brief analysis of why these genres match their requested mood",
  "displayTitle": "Ambient & Chill Music for Late Night Drives",  // Add example
  "targetAttributes": {
    "energy": 0.5,    // Lower for sad/relaxed, higher for upbeat
    "valence": 0.5,   // Lower for sad, higher for happy
    "tempo": 120,     // Lower for slow songs, higher for upbeat
    "danceability": 0.5  // Adjust based on the activity
  }
}

IMPORTANT:
- Weather mood must be one of: ${WEATHER_MOODS.join(", ")}
- Genres must be from the provided list
- Respect user's mood preferences - don't try to make sad requests happy
- Create natural, descriptive titles that reflect both the mood/activites and music style`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    // In the POST handler, update the rawAnalysis processing:
    const rawAnalysis = JSON.parse(
      completion.choices[0].message.content
    ) as MoodAnalysisResponse;

    // Update the response to be more conversational
    rawAnalysis.response = generateConversationalResponse(
      {
        wantsNewPlaylist: true, // Set based on your logic
        shouldRespond: true,
        response: rawAnalysis.response,
        moodAnalysis: rawAnalysis.moodAnalysis,
      },
      context
    );
    // Update conversation context
    rawAnalysis.conversationContext = {
      playlistGenerated: true,
      lastResponse: rawAnalysis.response,
      userPreferences: {
        activity: context?.userPreferences?.activity,
        mood: rawAnalysis.moodAnalysis,
        preferredGenres: rawAnalysis.genres,
      },
      currentPlaylist: {
        genres: rawAnalysis.genres,
        displayTitle: rawAnalysis.displayTitle,
      },
    };
    // Validate weather mood
    if (!WEATHER_MOODS.includes(rawAnalysis.weatherMood)) {
      rawAnalysis.weatherMood = "clear sky"; // Default fallback
    }

    // Validate genres with type safety
    rawAnalysis.genres = rawAnalysis.genres.filter(isValidSpotifyGenre);

    if (rawAnalysis.genres.length === 0) {
      rawAnalysis.genres = ["pop"]; // Default fallback
    }

    // If we have a Spotify access token, get music recommendations
    if (accessToken) {
      try {
        // Get Spotify recommendations based on the analysis
        const spotifyTracks = await getRecommendations(
          accessToken,
          rawAnalysis.genres
          // Removed targetAttributes since getRecommendations doesn't accept it
        );

        // Return combined analysis and recommendations
        return NextResponse.json({
          ...rawAnalysis,
          recommendations: spotifyTracks,
        });
      } catch (spotifyError) {
        console.error("Spotify recommendation error:", spotifyError);
        return NextResponse.json(rawAnalysis);
      }
    }

    return NextResponse.json(rawAnalysis);
  } catch (error) {
    console.error("Error in mood analysis API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
