import { renderHook, act } from "@testing-library/react";
import { useChatPersistence } from "../../src/hooks/useChatPersistence";
import { getWelcomeMessage } from "../../src/constants/chat";
import type { ChatMessage } from "../../src/types/chat";

const STORAGE_KEY = "moodmix-chat-sessions";

describe("useChatPersistence", () => {
  const mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Setup localStorage mock
    mockStorage[STORAGE_KEY] = "";
    Storage.prototype.getItem = jest.fn((key) => mockStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value.toString();
    });
    Storage.prototype.clear = jest.fn();
    jest.clearAllMocks();
  });

  it("initializes with a new session when storage is empty", () => {
    const { result } = renderHook(() => useChatPersistence());

    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].messages[0].role).toBe("assistant");
    expect(result.current.currentSessionId).toBe(result.current.sessions[0].id);
  });

  it("loads existing sessions from localStorage", () => {
    const mockSession = {
      id: "test-session",
      messages: [getWelcomeMessage()],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    mockStorage[STORAGE_KEY] = JSON.stringify([mockSession]);

    const { result } = renderHook(() => useChatPersistence());

    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].id).toBe("test-session");
    expect(result.current.currentSessionId).toBe("test-session");
  });

  it("creates a new session", () => {
    const { result } = renderHook(() => useChatPersistence());
    const initialSession = result.current.sessions[0];

    let newSessionId: string;
    act(() => {
      newSessionId = result.current.createNewSession();
    });

    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.currentSessionId).toBe(newSessionId);
    expect(result.current.sessions[1].messages[0].role).toBe("assistant");
  });

  it("retrieves a specific session", () => {
    const { result } = renderHook(() => useChatPersistence());
    const sessionId = result.current.sessions[0].id;

    const session = result.current.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessionId);
  });

  it("updates session messages", () => {
    const { result } = renderHook(() => useChatPersistence());
    const sessionId = result.current.sessions[0].id;

    const newMessage: ChatMessage = {
      role: "user",
      content: "Test message",
      timestamp: Date.now(),
    };

    act(() => {
      const session = result.current.getSession(sessionId);
      if (session) {
        result.current.updateSession(sessionId, [
          ...session.messages,
          newMessage,
        ]);
      }
    });

    const updatedSession = result.current.getSession(sessionId);
    expect(updatedSession?.messages).toHaveLength(2);
    expect(updatedSession?.messages[1]).toEqual(newMessage);
  });

  it("handles session deletion correctly", () => {
    const { result } = renderHook(() => useChatPersistence());

    // Initially we should have one session
    expect(result.current.sessions).toHaveLength(1);
    const initialSessionId = result.current.currentSessionId;

    // Create a new session
    act(() => {
      result.current.createNewSession();
    });

    // Now we should have two sessions
    expect(result.current.sessions).toHaveLength(2);
    const newSessionId = result.current.currentSessionId;

    // Delete the initial session
    act(() => {
      result.current.deleteSession(initialSessionId);
    });

    // After deletion:
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.currentSessionId).toBe(newSessionId);
    expect(result.current.sessions[0].messages[0].role).toBe("assistant");
  });

  it("creates new session when deleting the last one", () => {
    const { result } = renderHook(() => useChatPersistence());
    const initialSessionId = result.current.currentSessionId;

    act(() => {
      result.current.deleteSession(initialSessionId);
    });

    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].messages[0].role).toBe("assistant");
    expect(result.current.currentSessionId).not.toBe(initialSessionId);
    expect(result.current.currentSessionId).toBe(result.current.sessions[0].id);
  });

  it("persists sessions to localStorage", () => {
    const { result } = renderHook(() => useChatPersistence());

    act(() => {
      result.current.createNewSession();
    });

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );

    const storedData = JSON.parse(mockStorage[STORAGE_KEY]);
    expect(Array.isArray(storedData)).toBe(true);
    expect(storedData.length).toBe(2); // Initial session + new session
  });

  it("handles localStorage errors gracefully", () => {
    const mockError = new Error("Storage error");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    Storage.prototype.setItem = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() => useChatPersistence());

    act(() => {
      result.current.createNewSession();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error saving chat sessions:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles malformed storage data", () => {
    mockStorage[STORAGE_KEY] = "invalid json";

    const { result } = renderHook(() => useChatPersistence());

    // Should create a new session when storage is invalid
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].messages[0].role).toBe("assistant");
  });
});
