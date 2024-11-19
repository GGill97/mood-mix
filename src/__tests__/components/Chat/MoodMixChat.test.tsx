// src/__tests__/components/Chat/MoodMixChat.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MoodMixChat from "../../../components/Chat/MoodMixChat";

// Mock the chat components
jest.mock("../../../components/Chat/ChatHeader", () => ({
  ChatHeader: () => <div data-testid="chat-header">Chat Header</div>,
}));

jest.mock("../../../components/Chat/ChatHistorySidebar", () => ({
  ChatHistorySidebar: () => <div data-testid="chat-sidebar">Chat Sidebar</div>,
}));

// Mock the hooks and constants
const mockUseChatPersistence = {
  sessions: [
    {
      id: "test-session-1",
      messages: [],
      createdAt: Date.now(),
    },
  ],
  currentSessionId: "test-session-1",
  createNewSession: jest.fn(),
  updateSession: jest.fn(),
  getSession: jest.fn(),
  deleteSession: jest.fn(),
  setCurrentSessionId: jest.fn(),
};

jest.mock("../../../hooks/useChatPersistence", () => ({
  useChatPersistence: () => mockUseChatPersistence,
}));

// Mock the welcome message
const mockWelcomeMessage = {
  role: "assistant",
  content: "Welcome to MoodMix! How are you feeling today?",
  timestamp: Date.now(),
};

jest.mock("../../../constants/chat", () => ({
  getWelcomeMessage: () => mockWelcomeMessage,
}));

// Mock scrollTo
Element.prototype.scrollTo = jest.fn();

describe("MoodMixChat", () => {
  const defaultProps = {
    onMoodAnalysis: jest.fn(),
    spotifyAccessToken: "mock-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatPersistence.getSession.mockReturnValue({
      messages: [mockWelcomeMessage],
    });
  });

  it("renders initial chat interface", () => {
    render(<MoodMixChat {...defaultProps} />);

    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell me about your mood/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  it("handles message input and submission", async () => {
    // Mock successful API response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            genres: ["pop", "dance"],
            weatherMood: "clear sky",
            response: "Here are some upbeat songs for you!",
            moodAnalysis: "Positive and energetic",
          }),
      })
    );

    render(<MoodMixChat {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    const sendButton = screen.getByTestId("send-button");

    await userEvent.type(input, "I feel happy");
    await userEvent.click(sendButton);

    // Wait for response to appear
    await waitFor(() => {
      expect(screen.getByText("I feel happy")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Here are some upbeat songs for you!/)
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while analyzing", async () => {
    // Mock a delayed API response
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  response: "Here are some songs for you!",
                }),
            });
          }, 100); // Small delay to ensure loading state is visible
        })
    );

    render(<MoodMixChat {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    const sendButton = screen.getByTestId("send-button");

    await userEvent.type(input, "I feel happy");
    await userEvent.click(sendButton);

    // Check for loading spinner/message
    // Updated selector to match the actual loading indicator in your component
    await waitFor(() => {
      expect(
        screen.getByText(/analyzing your mood/i, { selector: "span" })
      ).toBeInTheDocument();
    });

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(
        screen.queryByText(/analyzing your mood/i, { selector: "span" })
      ).not.toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<MoodMixChat {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Tell me about your mood/i);
    const sendButton = screen.getByTestId("send-button");

    await userEvent.type(input, "I feel happy");
    await userEvent.click(sendButton);

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/I'm having trouble right now/i)
      ).toBeInTheDocument();
    });
  });
});

/*  ✓ renders initial chat interface (35 ms)
    ✓ handles message input and submission (91 ms)
    ✓ shows loading state while analyzing (189 ms)
    ✓ handles API errors gracefully (64 ms)
*/
