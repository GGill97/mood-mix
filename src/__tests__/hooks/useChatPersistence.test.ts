// src/__tests__/hooks/useChatPersistence.test.ts
import { renderHook, act } from "@testing-library/react";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { ChatMessage } from "@/types/chat";

// Mock consistent timestamp
const MOCK_NOW = 1234567890000;
let mockTimestamp = MOCK_NOW;

// Mock Date.now() to return incremental timestamps
jest.spyOn(Date, "now").mockImplementation(() => {
  const timestamp = mockTimestamp;
  mockTimestamp += 1; // Increment for next call
  return timestamp;
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key]),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock welcome message
jest.mock("@/constants/chat", () => ({
  getWelcomeMessage: () => ({
    role: "assistant",
    content: "Welcome to MoodMix!",
    timestamp: MOCK_NOW,
  }),
}));

describe("useChatPersistence", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    // Reset timestamp for each test
    mockTimestamp = MOCK_NOW;
    // Mock console.error
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Initial State", () => {
    it("creates a new session when no sessions exist", () => {
      const { result } = renderHook(() => useChatPersistence());

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].messages[0].content).toBe(
        "Welcome to MoodMix!"
      );
      expect(result.current.currentSessionId).toBe(
        result.current.sessions[0].id
      );
    });

    it("loads existing sessions from localStorage", () => {
      const existingSessions = [
        {
          id: "123",
          messages: [
            { role: "assistant", content: "Hello", timestamp: MOCK_NOW },
          ],
          createdAt: MOCK_NOW,
          lastUpdated: MOCK_NOW,
        },
      ];

      mockLocalStorage.setItem(
        "moodmix-chat-sessions",
        JSON.stringify(existingSessions)
      );

      const { result } = renderHook(() => useChatPersistence());

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].id).toBe("123");
      expect(result.current.currentSessionId).toBe("123");
    });
  });

  describe("Session Management", () => {
    it("creates new session with welcome message", () => {
      const { result } = renderHook(() => useChatPersistence());

      // Store initial session count
      const initialLength = result.current.sessions.length;

      act(() => {
        result.current.createNewSession();
      });

      expect(result.current.sessions).toHaveLength(initialLength + 1);
      expect(
        result.current.sessions[result.current.sessions.length - 1].messages[0]
          .content
      ).toBe("Welcome to MoodMix!");
    });

    it("updates session messages", () => {
      const { result } = renderHook(() => useChatPersistence());
      const initialSessionId = result.current.currentSessionId;

      const newMessages: ChatMessage[] = [
        {
          role: "assistant",
          content: "Welcome to MoodMix!",
          timestamp: MOCK_NOW,
        },
        { role: "user", content: "Hello!", timestamp: MOCK_NOW + 1 },
      ];

      act(() => {
        result.current.updateSession(initialSessionId, newMessages);
      });

      const updatedSession = result.current.getSession(initialSessionId);
      expect(updatedSession?.messages).toHaveLength(2);
      expect(updatedSession?.messages[1].content).toBe("Hello!");
    });

    it("deletes session and creates new one when deleting last session", () => {
      const { result } = renderHook(() => useChatPersistence());

      // Store the ID of the session we'll delete
      const sessionToDelete = result.current.currentSessionId;

      act(() => {
        result.current.deleteSession(sessionToDelete);
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.currentSessionId).not.toBe(sessionToDelete);
      expect(result.current.sessions[0]).toEqual(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "assistant",
              content: "Welcome to MoodMix!",
            }),
          ]),
        })
      );
    });

    it("deletes session and switches to existing one when there are multiple sessions", () => {
      const { result } = renderHook(() => useChatPersistence());

      // Store the first session's ID
      const firstSession = result.current.sessions[0];

      // Create a second session
      act(() => {
        result.current.createNewSession();
      });

      const secondSessionId = result.current.currentSessionId;

      // Verify we have two sessions
      expect(result.current.sessions).toHaveLength(2);

      // Delete the second session
      act(() => {
        result.current.deleteSession(secondSessionId);
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.currentSessionId).toBe(firstSession.id);
      expect(result.current.sessions[0].id).toBe(firstSession.id);
    });

    it("switches current session", () => {
      const { result } = renderHook(() => useChatPersistence());

      // Create a second session
      act(() => {
        result.current.createNewSession();
      });

      const firstSessionId = result.current.sessions[0].id;

      act(() => {
        result.current.setCurrentSessionId(firstSessionId);
      });

      expect(result.current.currentSessionId).toBe(firstSessionId);
    });
  });

  describe("Persistence", () => {
    it("saves sessions to localStorage when updated", () => {
      const { result } = renderHook(() => useChatPersistence());

      act(() => {
        result.current.createNewSession();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedSessions = JSON.parse(
        mockLocalStorage.setItem.mock.calls[
          mockLocalStorage.setItem.mock.calls.length - 1
        ][1]
      );
      expect(savedSessions.length).toBeGreaterThan(0);
    });

    it("handles localStorage errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error");

      // Mock localStorage error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("Storage full");
      });

      const { result } = renderHook(() => useChatPersistence());

      act(() => {
        result.current.createNewSession();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving chat sessions:",
        expect.any(Error)
      );
      expect(result.current.sessions.length).toBeGreaterThan(0);
    });
  });

  describe("Cleanup", () => {
    it("removes old sessions but keeps current session", () => {
      const { result } = renderHook(() => useChatPersistence());

      // Add an old session manually to the state
      act(() => {
        const oldSession = {
          id: "old-session",
          messages: [],
          createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days old
          lastUpdated: Date.now() - 8 * 24 * 60 * 60 * 1000,
        };

        result.current.sessions.push(oldSession);
        result.current.setCurrentSessionId("old-session");
      });

      // Run cleanup
      act(() => {
        result.current.cleanupOldSessions();
      });

      // Verify the current session is kept regardless of age
      expect(result.current.getSession("old-session")).toBeTruthy();
      expect(result.current.currentSessionId).toBe("old-session");
    });
  });
});
/** useChatPersistence
    Initial State
      ✓ creates a new session when no sessions exist (8 ms)
      ✓ loads existing sessions from localStorage (2 ms)
    Session Management
      ✓ creates new session with welcome message (1 ms)
      ✓ updates session messages (1 ms)
      ✓ deletes session and creates new one when deleting last session (2 ms)
      ✓ deletes session and switches to existing one when there are multiple sessions (1 ms)
      ✓ switches current session (3 ms)
    Persistence
      ✓ saves sessions to localStorage when updated (1 ms)
      ✓ handles localStorage errors gracefully (1 ms)
    Cleanup
      ✓ removes old sessions but keeps current session (1 ms)

 */