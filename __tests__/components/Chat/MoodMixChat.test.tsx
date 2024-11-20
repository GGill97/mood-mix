// tests/components/Chat/MoodMixChat.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MoodMixChat from "@/components/Chat/MoodMixChat";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { getWelcomeMessage } from "@/constants/chat";

// Mock scrollTo functionality
window.HTMLElement.prototype.scrollTo = jest.fn();

// Mock the hooks and components
jest.mock("@/hooks/useChatPersistence");
jest.mock("@/components/Chat/ChatHeader", () => ({
  ChatHeader: () => <div data-testid="chat-header">Chat Header</div>,
}));
jest.mock("@/components/Chat/ChatHistorySidebar", () => ({
  ChatHistorySidebar: () => <div data-testid="chat-sidebar">Chat Sidebar</div>,
}));
jest.mock("lucide-react", () => ({
  SendHorizontal: () => <div data-testid="send-icon">Send</div>,
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Mock fetch for API calls
global.fetch = jest.fn();

// Silence console.error for expected error in test
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Error: API Error")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("MoodMixChat", () => {
  const mockOnMoodAnalysis = jest.fn();
  const mockProps = {
    onMoodAnalysis: mockOnMoodAnalysis,
    spotifyAccessToken: "mock-token",
  };

  const mockChatPersistence = {
    sessions: [],
    currentSessionId: "1",
    createNewSession: jest.fn(),
    updateSession: jest.fn(),
    getSession: jest.fn(),
    deleteSession: jest.fn(),
    setCurrentSessionId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useChatPersistence as jest.Mock).mockReturnValue(mockChatPersistence);
    (global.fetch as jest.Mock).mockReset();
  });

  test("renders chat interface with initial components", () => {
    render(<MoodMixChat {...mockProps} />);
    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell me about your mood/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  test("handles message input and submission", async () => {
    const mockResponse = {
      genres: ["pop", "rock"],
      response: "Analysis response",
      weatherMood: "sunny",
      moodAnalysis: "Happy mood",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<MoodMixChat {...mockProps} />);

    // Type a message
    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    fireEvent.change(input, { target: { value: "I feel happy today" } });

    // Submit the message
    const submitButton = screen.getByTestId("send-button");
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    // Wait for response using a more flexible text matcher
    await waitFor(() => {
      expect(mockOnMoodAnalysis).toHaveBeenCalledWith(mockResponse);
      expect(screen.getByText("I feel happy today")).toBeInTheDocument();
      // Use partial text match for the response
      expect(screen.getByText(/Analysis response/)).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<MoodMixChat {...mockProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(
        screen.getByText(/I'm having trouble right now/i)
      ).toBeInTheDocument();
      expect(mockOnMoodAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          genres: ["pop", "dance"],
        })
      );
    });
  });

  test("displays message history from session", () => {
    const mockSession = {
      id: "1",
      messages: [
        { role: "user", content: "Test message", timestamp: Date.now() },
        {
          role: "assistant",
          content: "Response message",
          timestamp: Date.now(),
        },
      ],
    };

    mockChatPersistence.getSession.mockReturnValue(mockSession);

    render(<MoodMixChat {...mockProps} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Response message")).toBeInTheDocument();
  });

  test("detects refresh playlist keywords", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          genres: ["pop"],
          response: "Refreshing playlist",
          weatherMood: "sunny",
          moodAnalysis: "Happy mood",
        }),
    });

    render(<MoodMixChat {...mockProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    fireEvent.change(input, { target: { value: "refresh the playlist" } });
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/chat/analyze-mood",
        expect.objectContaining({
          body: expect.stringContaining('"shouldUpdatePlaylist":true'),
        })
      );
    });
  });

  test("disables input while analyzing", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MoodMixChat {...mockProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    const submitButton = screen.getByTestId("send-button");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(submitButton);

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
