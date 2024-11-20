// tests/components/Chat/ChatHistorySidebar.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatHistorySidebar } from "@/components/Chat/ChatHistorySidebar";
import { Trash2 } from "lucide-react";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Trash2: () => <div data-testid="trash-icon">Delete</div>,
}));

describe("ChatHistorySidebar", () => {
  const mockSessions = [
    {
      id: "1",
      messages: [
        {
          role: "user",
          content: "First chat message",
          timestamp: 1700000000000,
        },
      ],
      createdAt: 1700000000000,
      lastUpdated: 1700000000000,
    },
    {
      id: "2",
      messages: [
        {
          role: "user",
          content: "Second chat message",
          timestamp: 1700000100000,
        },
      ],
      createdAt: 1700000100000,
      lastUpdated: 1700000100000,
    },
  ];

  const defaultProps = {
    sessions: mockSessions,
    currentSessionId: "1",
    onSelectSession: jest.fn(),
    onDeleteSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders chat history sidebar with sessions", () => {
    render(<ChatHistorySidebar {...defaultProps} />);
    expect(screen.getByText("Chat History")).toBeInTheDocument();
    expect(screen.getByText("First chat message")).toBeInTheDocument();
    expect(screen.getByText("Second chat message")).toBeInTheDocument();
  });

  test("shows empty state message when no sessions", () => {
    render(<ChatHistorySidebar {...defaultProps} sessions={[]} />);
    expect(screen.getByText("No chat history yet")).toBeInTheDocument();
  });

  test("calls onSelectSession when clicking a session", () => {
    render(<ChatHistorySidebar {...defaultProps} />);
    fireEvent.click(screen.getByText("Second chat message"));
    expect(defaultProps.onSelectSession).toHaveBeenCalledWith("2");
  });

  test("calls onDeleteSession when clicking delete button", () => {
    render(<ChatHistorySidebar {...defaultProps} />);

    // Get delete buttons - they appear in reverse order due to sessions.reverse()
    const deleteButtons = screen.getAllByTestId("trash-icon");

    // Click the first visible delete button (which is actually the second session due to reverse)
    fireEvent.click(deleteButtons[0]);

    // Expect the second session's ID since the list is reversed
    expect(defaultProps.onDeleteSession).toHaveBeenCalledWith("2");
  });

  test("applies active styles to current session", () => {
    render(<ChatHistorySidebar {...defaultProps} />);

    // Find session containers by their preview text
    const session1 = screen
      .getByText("First chat message")
      .closest("div.group");
    const session2 = screen
      .getByText("Second chat message")
      .closest("div.group");

    // Check that active session has correct background class
    expect(session1).toHaveClass("bg-terracotta/20");
    expect(session2).not.toHaveClass("bg-terracotta/20");
  });

  test("formats dates correctly", () => {
    render(<ChatHistorySidebar {...defaultProps} />);
    const date = new Date(1700000000000);
    const formattedDate = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  test("generates correct preview text for sessions", () => {
    const sessionsWithEmptyMessages = [
      {
        id: "3",
        messages: [],
        createdAt: 1700000000000,
        lastUpdated: 1700000000000,
      },
    ];

    render(
      <ChatHistorySidebar
        {...defaultProps}
        sessions={sessionsWithEmptyMessages}
      />
    );
    expect(screen.getByText("New conversation")).toBeInTheDocument();
  });
});
