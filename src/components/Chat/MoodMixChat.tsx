/**
 * MoodMixChat Component
 *
 * Purpose:
 * Provides an interactive chat interface for users to express their mood
 * and receive personalized music recommendations.
 *
 * Main Functionality:
 * 1. Handles user-assistant conversation
 * 2. Analyzes mood from user messages
 * 3. Generates music genre suggestions
 * 4. Manages chat history and display
 *
 * Flow:
 * 1. User enters mood/preference
 * 2. Message sent for analysis
 * 3. Receives and displays response
 * 4. Updates parent with genre preferences
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SendHorizontal, Loader2, Music } from "lucide-react";
import { ChatMessage, MoodAnalysis, MoodMixChatProps } from "@/types/chat";

// === CONSTANTS ===
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your music mood assistant. Tell me how you're feeling, what you're doing, or what kind of music you're in the mood for!",
  timestamp: Date.now(),
};

const REFRESH_KEYWORDS = ["refresh", "new playlist", "different songs"];

const FALLBACK_ANALYSIS: MoodAnalysis = {
  genres: ["pop", "dance"],
  weatherMood: "clear sky",
  response: "Here are some general recommendations for you.",
  moodAnalysis: "Fallback due to analysis error",
};

export default function MoodMixChat({
  onMoodAnalysis,
  className = "",
  spotifyAccessToken,
}: MoodMixChatProps) {
  // === STATE MANAGEMENT ===
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === AUTO-SCROLL FUNCTIONALITY ===
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // === MOOD ANALYSIS ===
  const analyzeMoodAndContext = useCallback(
    async (userMessage: string) => {
      try {
        setIsAnalyzing(true);
        const isRefreshRequest = REFRESH_KEYWORDS.some((keyword) =>
          userMessage.toLowerCase().includes(keyword)
        );

        const response = await fetch("/api/chat/analyze-mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            context: messages.slice(-5),
            accessToken: spotifyAccessToken,
            shouldUpdatePlaylist: isRefreshRequest,
          }),
        });

        if (!response.ok) throw new Error("Failed to analyze mood");

        const analysis: MoodAnalysis = await response.json();

        if (!analysis.genres?.length) {
          throw new Error("No genres received from mood analysis");
        }

        onMoodAnalysis(analysis);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              analysis.response +
              (!isRefreshRequest && analysis.genres.length > 0
                ? "\n\nWould you like me to refresh the playlist with different songs in this style? Just ask me to refresh or try something new!"
                : ""),
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error("Error in mood analysis:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I'm having trouble right now. ${
              error instanceof Error ? error.message : "Something went wrong"
            }. Let me try some general recommendations for you.`,
            timestamp: Date.now(),
          },
        ]);
        onMoodAnalysis(FALLBACK_ANALYSIS);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [messages, onMoodAnalysis, spotifyAccessToken]
  );

  // === FORM SUBMISSION ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isAnalyzing) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      },
    ]);

    await analyzeMoodAndContext(userMessage);
  };

  // === RENDER UI ===
  return (
    <Card className={`w-full h-full overflow-hidden ${className}`}>
      <div className="flex flex-col h-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                max-w-[80%] p-4 rounded-2xl shadow-sm backdrop-blur-sm
                ${
                  message.role === "user"
                    ? "bg-terracotta/20 text-soft-brown ml-4 rounded-br-sm"
                    : "bg-white/80 text-soft-brown/90 mr-4 rounded-bl-sm"
                }
              `}
              >
                {message.content}
                <div
                  className={`text-xs mt-1 opacity-50 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-white/80 p-4 rounded-2xl rounded-bl-sm shadow-sm backdrop-blur-sm flex items-center space-x-3 text-soft-brown/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing your mood...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white/5 border-t border-terracotta/10"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your mood or what you're doing..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/95 
                     placeholder:text-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-terracotta/30 shadow-sm text-soft-brown"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg
                      bg-terracotta/20 hover:bg-terracotta/30 
                      transition-all duration-200 disabled:opacity-50 text-soft-brown"
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}
