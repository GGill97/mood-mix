// __tests__/components/Chat/ChatHeader.test.tsx
import React from "react";
import { render, screen, fireEvent } from "../../test-utils";
import { ChatHeader } from "@/components/Chat/ChatHeader";

describe("ChatHeader", () => {
  const defaultProps = {
    onNewChat: jest.fn(),
    onToggleHistory: jest.fn(),
    isHistoryOpen: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header with all elements", () => {
    render(<ChatHeader {...defaultProps} />);

    expect(screen.getByText("MoodMix Chat")).toBeInTheDocument();
    expect(screen.getByText("New Chat")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /chat history/i })
    ).toBeInTheDocument();
  });

  it("calls onNewChat when New Chat button is clicked", () => {
    render(<ChatHeader {...defaultProps} />);

    fireEvent.click(screen.getByText("New Chat"));
    expect(defaultProps.onNewChat).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleHistory when history button is clicked", () => {
    render(<ChatHeader {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /chat history/i }));
    expect(defaultProps.onToggleHistory).toHaveBeenCalledTimes(1);
  });

  it("shows correct icon based on isHistoryOpen prop", () => {
    const { rerender } = render(<ChatHeader {...defaultProps} />);

    // When closed, History icon should be visible
    expect(
      screen.getByRole("button", { name: /chat history/i })
    ).toHaveAttribute("title", "Chat History");

    // When open, X icon should be visible
    rerender(<ChatHeader {...defaultProps} isHistoryOpen={true} />);
    expect(
      screen.getByRole("button", { name: /chat history/i })
    ).toHaveAttribute("title", "Chat History");
  });

  it("applies correct styles when history is open", () => {
    render(<ChatHeader {...defaultProps} isHistoryOpen={true} />);

    const historyButton = screen.getByRole("button", { name: /chat history/i });
    expect(historyButton).toHaveClass("bg-white/10");
  });
});
