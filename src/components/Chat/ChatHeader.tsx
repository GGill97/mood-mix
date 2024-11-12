// src/components/Chat/ChatHeader.tsx
import React from "react";
import { PlusCircle, History, X } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  sessionDate?: Date;
}

export function ChatHeader({
  onNewChat,
  onToggleHistory,
  isHistoryOpen,
  sessionDate,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-terracotta/10 bg-white/5">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <span className="text-soft-brown/70 text-sm">MoodMix Chat</span>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-soft-brown/70 hover:text-soft-brown
                     transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onToggleHistory}
          className={`p-1.5 rounded-lg transition-colors text-soft-brown/70 
                     hover:text-soft-brown ${
                       isHistoryOpen ? "bg-white/10" : ""
                     }`}
          title="Chat History"
        >
          {isHistoryOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <History className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
