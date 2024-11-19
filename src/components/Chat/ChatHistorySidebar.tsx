import React from "react";
import { Trash2 } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface ChatHistorySidebarProps {
  sessions: Array<{
    id: string;
    messages: ChatMessage[];
    createdAt: number;
    lastUpdated: number;
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
}: ChatHistorySidebarProps) {
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get first user message or fallback text
  const getSessionPreview = (messages: ChatMessage[]) => {
    const firstUserMessage = messages.find((msg) => msg.role === "user");
    return firstUserMessage?.content || "New conversation";
  };

  return (
    <div className="w-80 h-full bg-white/95 border-l border-terracotta/10 shadow-lg">
      <div className="p-4 border-b border-terracotta/10">
        <h2 className="text-lg font-semibold text-soft-brown">Chat History</h2>
      </div>

      <div className="overflow-y-auto h-[calc(100%-64px)] custom-scrollbar">
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-soft-brown/70 text-center">
            No chat history yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions
              .slice()
              .reverse()
              .map((session) => (
                <div
                  key={session.id}
                  className={`
                  group relative p-3 rounded-lg cursor-pointer
                  transition-all duration-200 hover:bg-terracotta/10
                  ${session.id === currentSessionId ? "bg-terracotta/20" : ""}
                `}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="pr-8">
                    <div className="text-sm font-medium text-soft-brown truncate">
                      {getSessionPreview(session.messages)}
                    </div>
                    <div className="text-xs text-soft-brown/60 mt-1">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className={`
                    absolute right-2 top-1/2 -translate-y-1/2
                    p-1.5 rounded-md opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    hover:bg-terracotta/20 text-soft-brown/70
                    hover:text-soft-brown
                  `}
                    aria-label="Delete chat session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
