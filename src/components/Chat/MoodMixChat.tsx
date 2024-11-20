/**
 * MoodMixChat Component
 *
 * Purpose: Provides chat interface for mood-based music recommendations

Manages a chat interface where users can discuss their mood
Analyzes user messages to recommend music based on mood
Handles chat history and sessions
Provides features like creating new chats and viewing chat history
Uses a persistent storage system for chat sessions
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
// import { Card } from "@/components/ui/card";
import { SendHorizontal, Loader2 } from "lucide-react";
import { ChatMessage, MoodAnalysis, MoodMixChatProps } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { getWelcomeMessage } from "@/constants/chat";

// === Constants ===
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
  // === State Management ===
  const {
    sessions,
    currentSessionId,
    createNewSession,
    updateSession,
    getSession,
    deleteSession,
    setCurrentSessionId,
  } = useChatPersistence();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === Session Management ===
  // Load messages when session changes
  useEffect(() => {
    if (!currentSessionId) return;

    const session = getSession(currentSessionId);
    if (session?.messages) {
      // Prevent unnecessary updates
      if (JSON.stringify(messages) !== JSON.stringify(session.messages)) {
        setMessages(session.messages);
      }
    }
  }, [currentSessionId, getSession]); // Intentionally omit messages to prevent loops

  // Save messages to session (debounced)
  useEffect(() => {
    if (!currentSessionId || !messages.length) return;

    const timeoutId = setTimeout(() => {
      const session = getSession(currentSessionId);
      if (
        session &&
        JSON.stringify(session.messages) !== JSON.stringify(messages)
      ) {
        updateSession(currentSessionId, messages);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [messages, currentSessionId, updateSession, getSession]);

  // === Handlers ===
  // Create new chat
  const handleNewChat = useCallback(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([welcomeMessage]);
    createNewSession();
  }, [createNewSession]);

  // Switch sessions
  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      if (sessionId === currentSessionId) return;
      setIsHistoryOpen(false);
      setCurrentSessionId(sessionId);
    },
    [currentSessionId, setCurrentSessionId]
  );

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.parentElement?.scrollTo({
        top: messagesEndRef.current.parentElement.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // === Mood Analysis ===
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
          throw new Error("No genres received");
        }

        onMoodAnalysis(analysis);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              analysis.response +
              (!isRefreshRequest && analysis.genres.length > 0
                ? "\n\nWould you like me to refresh the playlist with different songs in this style?"
                : ""),
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error("Error:", error);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isAnalyzing) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: Date.now() },
    ]);

    await analyzeMoodAndContext(userMessage);
  };

  // === Render UI === [Rest of the render code remains the same]
  // === Render UI ===
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <ChatHeader
        onNewChat={handleNewChat}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Messages Display */}
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
                max-w-[80%] p-4 rounded-2xl shadow-sm
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

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-white/80 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-3 text-soft-brown/70">
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
            data-testid="send-button"
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

      {/* Chat History Sidebar */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-in-out
          ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <ChatHistorySidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSessionSelect}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* History Backdrop */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}
