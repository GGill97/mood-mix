/**
 * Custom hook for managing chat session persistence
 *
 * Handles:
 * - Multiple chat sessions storage and retrieval
 * - Session CRUD operations
 * - LocalStorage persistence
 * - Current session tracking
 * - Session cleanup
 */
import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import { getWelcomeMessage } from "@/constants/chat";
// import { time } from "console";

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
  // Core state management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  /**
   * Creates a new chat session with a welcome message
   * @returns string The ID of the newly created session
   */
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [getWelcomeMessage()],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  /**
   * Retrieves a specific session by ID
   * @param sessionId The ID of the session to retrieve
   * @returns ChatSession | undefined The found session or undefined
   */
  const getSession = useCallback(
    (sessionId: string) => {
      return sessions.find((session) => session.id === sessionId);
    },
    [sessions]
  );

  /**
   * Updates messages for a specific session
   * Includes optimization to prevent unnecessary updates
   * @param sessionId The ID of the session to update
   * @param messages New array of messages
   */
  const updateSession = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      setSessions((prev) => {
        // Check if update is necessary
        const existingSession = prev.find((s) => s.id === sessionId);
        if (
          !existingSession ||
          JSON.stringify(existingSession.messages) === JSON.stringify(messages)
        ) {
          return prev; // No update needed
        }

        // Update the session with new messages
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

  /**
   * Deletes a session and handles post-deletion state
   *
   * Edge Cases Handled:
   * 1. Deleting the current session
   * 2. Deleting the last remaining session
   * 3. Deleting a session other than the current one
   *
   * @param sessionId The ID of the session to delete
   */
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        // Remove the specified session
        const newSessions = prev.filter((session) => session.id !== sessionId);

        // Handle current session deletion
        if (currentSessionId === sessionId) {
          if (newSessions.length > 0) {
            // Case 1: Other sessions exist - switch to most recent
            const lastSession = newSessions[newSessions.length - 1];
            setCurrentSessionId(lastSession.id);
          } else {
            // Case 2: No sessions left - create new one
            // Important: Create directly instead of using createNewSession
            // to avoid state update conflicts
            const timestamp = Date.now();
            const newSession = {
              // Add 1 to timestamp to ensure unique ID
              id: timestamp.toString(),
              messages: [getWelcomeMessage()],
              createdAt: timestamp,
              lastUpdated: timestamp,
            };
            newSessions.push(newSession);
            setCurrentSessionId(newSession.id);
          }
        }
        // Case 3: Deleted session wasn't current - no need to change currentSessionId

        return newSessions;
      });
    },
    [currentSessionId]
  );

  /**
   * Removes sessions older than one week
   * Preserves current session regardless of age
   */
  const cleanupOldSessions = useCallback(() => {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    setSessions((prev) =>
      prev.filter((session) => {
        const age = Date.now() - session.createdAt;
        // Keep if session is current or less than a week old
        return age < ONE_WEEK || session.id === currentSessionId;
      })
    );
  }, [currentSessionId]);

  /**
   * Load sessions from localStorage on mount
   * Creates initial session if needed
   */
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
            createNewSession(); // Empty stored sessions
          }
        } else {
          createNewSession(); // No storage exists
        }
      } catch (error) {
        console.error("Error loading chat sessions:", error);
        createNewSession(); // Error fallback
      }
    };

    loadSessions();
  }, [createNewSession]);

  /**
   * Persist sessions to localStorage whenever they change
   * Includes error handling for storage failures
   */
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.error("Error saving chat sessions:", error);
        // Continue even if storage fails - sessions will work in-memory
      }
    }
  }, [sessions]);

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
