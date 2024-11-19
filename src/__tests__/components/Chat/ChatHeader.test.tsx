// src/__tests__/components/Chat/ChatHeader.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatHeader } from "@/components/Chat/ChatHeader";

// Move test constants to the top for easy maintenance
const TEST_TITLE = "MoodMix Chat";
const TEST_NEW_CHAT = "New Chat";
const TEST_HISTORY = "Chat History";

describe("ChatHeader", () => {
  // Group related test setup
  const defaultProps = {
    onNewChat: jest.fn(),
    onToggleHistory: jest.fn(),
    isHistoryOpen: false,
  };

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders header with title and buttons", () => {
      render(<ChatHeader {...defaultProps} />);

      expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
      expect(screen.getByText(TEST_NEW_CHAT)).toBeInTheDocument();
      expect(screen.getByTitle(TEST_HISTORY)).toBeInTheDocument();
    });

    it("handles optional session date prop", () => {
      const testDate = new Date("2024-01-01");
      render(<ChatHeader {...defaultProps} sessionDate={testDate} />);
      expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    });
  });

  describe("Button Interactions", () => {
    it("calls onNewChat when New Chat button is clicked", () => {
      render(<ChatHeader {...defaultProps} />);

      const newChatButton = screen.getByText(TEST_NEW_CHAT).closest("button");
      fireEvent.click(newChatButton!);

      expect(defaultProps.onNewChat).toHaveBeenCalledTimes(1);
    });

    it("calls onToggleHistory when history button is clicked", () => {
      render(<ChatHeader {...defaultProps} />);

      const historyButton = screen.getByTitle(TEST_HISTORY);
      fireEvent.click(historyButton);

      expect(defaultProps.onToggleHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("History Toggle States", () => {
    it("shows correct initial state when history is closed", () => {
      render(<ChatHeader {...defaultProps} />);

      const historyButton = screen.getByTitle(TEST_HISTORY);
      expect(historyButton).not.toHaveClass("bg-white/10");
    });

    it("shows correct state when history is open", () => {
      render(<ChatHeader {...defaultProps} isHistoryOpen={true} />);

      const historyButton = screen.getByTitle(TEST_HISTORY);
      expect(historyButton).toHaveClass("bg-white/10");
    });

    it("updates visual state when history toggle changes", () => {
      const { rerender } = render(<ChatHeader {...defaultProps} />);

      // Initial state
      let historyButton = screen.getByTitle(TEST_HISTORY);
      expect(historyButton).not.toHaveClass("bg-white/10");

      // Rerender with history open
      rerender(<ChatHeader {...defaultProps} isHistoryOpen={true} />);
      historyButton = screen.getByTitle(TEST_HISTORY);
      expect(historyButton).toHaveClass("bg-white/10");
    });
  });

  describe("Accessibility", () => {
    it("provides accessible buttons", () => {
      render(<ChatHeader {...defaultProps} />);

      const newChatButton = screen.getByText(TEST_NEW_CHAT).closest("button");
      const historyButton = screen.getByTitle(TEST_HISTORY);

      expect(newChatButton).toHaveAttribute("type", "button");
      expect(historyButton).toHaveAttribute("type", "button");
    });
  });
});

/*ChatHeader
    Rendering
      ✓ renders header with title and buttons (20 ms)
      ✓ handles optional session date prop (3 ms)
    Button Interactions
      ✓ calls onNewChat when New Chat button is clicked (4 ms)
      ✓ calls onToggleHistory when history button is clicked (2 ms)
    History Toggle States
      ✓ shows correct initial state when history is closed (2 ms)
      ✓ shows correct state when history is open (1 ms)
      ✓ updates visual state when history toggle changes (3 ms)
    Accessibility
      ✓ provides accessible buttons (2 ms)*/
