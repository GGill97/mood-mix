/**
 * Chat Persistence Hook
 *
 * Purpose:
 * - Manage chat sessions in localStorage
 * - Handle session CRUD operations
 * - Maintain chat state between refreshes
 *
 * Flow:
 * 1. Load sessions from localStorage
 * 2. Create/Update/Delete sessions
 * 3. Save changes back to localStorage
 */

import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import { getWelcomeMessage } from "@/constants/chat";

// Type definitions
interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastUpdated: number;
}

// localStorage key for sessions
const STORAGE_KEY = "moodmix-chat-sessions";

export function useChatPersistence() {
  // Core state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  // === Session Management Functions ===

  // Create new session with welcome message
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [getWelcomeMessage()], // Get fresh welcome message
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Get session by ID
  const getSession = useCallback(
    (sessionId: string) => {
      return sessions.find((session) => session.id === sessionId);
    },
    [sessions]
  );

  // Update session messages
  // In useChatPersistence.ts

  const updateSession = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      setSessions((prev) => {
        // Prevent unnecessary state updates
        const existingSession = prev.find((s) => s.id === sessionId);
        if (
          !existingSession ||
          JSON.stringify(existingSession.messages) === JSON.stringify(messages)
        ) {
          return prev;
        }

        return prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages,
                lastUpdated: Date.now(),
              }
            : session
        );
      });
    },
    []
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const newSessions = prev.filter((session) => session.id !== sessionId);

        // If we deleted current session, switch to most recent or create new
        if (currentSessionId === sessionId) {
          if (newSessions.length > 0) {
            // Switch to most recent session
            setCurrentSessionId(newSessions[newSessions.length - 1].id);
          } else {
            // Create new session if no sessions left
            createNewSession();
          }
        }

        return newSessions;
      });
    },
    [currentSessionId, createNewSession]
  );

  // === LocalStorage Management ===

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedSessions = JSON.parse(stored);
          if (parsedSessions.length > 0) {
            setSessions(parsedSessions);
            // Set most recent session as current
            setCurrentSessionId(parsedSessions[parsedSessions.length - 1].id);
          } else {
            // Create initial session if stored sessions empty
            createNewSession();
          }
        } else {
          // Create initial session if no storage exists
          createNewSession();
        }
      } catch (error) {
        console.error("Error loading chat sessions:", error);
        // Fallback to new session on error
        createNewSession();
      }
    };

    loadSessions();
  }, [createNewSession]);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.error("Error saving chat sessions:", error);
      }
    }
  }, [sessions]);

  // Optional: Session cleanup (remove old sessions)
  const cleanupOldSessions = useCallback(() => {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    setSessions((prev) =>
      prev.filter((session) => {
        const age = Date.now() - session.createdAt;
        return age < ONE_WEEK || session.id === currentSessionId;
      })
    );
  }, [currentSessionId]);

  // Return functions and state
  return {
    // State
    sessions,
    currentSessionId,

    // Session management
    setCurrentSessionId,
    createNewSession,
    updateSession,
    getSession,
    deleteSession,

    // Cleanup
    cleanupOldSessions,
  };
}
