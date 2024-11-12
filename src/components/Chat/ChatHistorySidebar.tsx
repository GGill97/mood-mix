// src/components/Chat/ChatHistorySidebar.tsx
import React from "react";
import { Trash2 } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface ChatHistoryProps {
  sessions: Array<{
    id: string;
    messages: ChatMessage[];
    createdAt: number;
  }>;
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}: ChatHistoryProps) {
  // Get first user message for preview
  const getPreview = (messages: ChatMessage[]) => {
    // Find first user message for preview
    const userMessage = messages.find((m) => m.role === "user");
    // If no user message, show first assistant message
    if (!userMessage) {
      const assistantMessage = messages.find((m) => m.role === "assistant");
      return assistantMessage ? assistantMessage.content : "New conversation";
    }
    // Truncate long messages
    return userMessage.content.length > 40
      ? `${userMessage.content.slice(0, 40)}...`
      : userMessage.content;
  };

  return (
    <div className="w-72 h-full bg-white shadow-lg">
      <div className="p-4 border-b border-terracotta/10 bg-white">
        <h3 className="text-lg font-medium text-soft-brown">Chat History</h3>
      </div>

      <div className="overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`
              w-full p-4 border-b border-terracotta/10
              hover:bg-sandy-beige/20 transition-colors
              ${
                session.id === currentSessionId
                  ? "bg-sandy-beige/30"
                  : "bg-white"
              }
            `}
          >
            {/* Time and Actions Row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-soft-brown/90">
                {new Date(session.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                onClick={() => onDeleteSession(session.id)}
                className="p-1.5 rounded-lg hover:bg-sandy-beige/30 
                          text-soft-brown/70 hover:text-soft-brown"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Message Preview - Made clickable */}
            <div
              onClick={() => onSelectSession(session.id)}
              className="cursor-pointer"
            >
              <div className="text-sm text-soft-brown/80 line-clamp-2">
                {getPreview(session.messages)}
              </div>

              <div className="text-xs text-soft-brown/60 mt-1">
                {session.messages.length} messages
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
