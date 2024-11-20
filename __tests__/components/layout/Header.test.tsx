// tests/components/layout/Header.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";
import "@testing-library/jest-dom";


describe("Header", () => {
  test("renders header content", () => {
    render(<Header />);

    // Check if "Mood Mix" text is present
    const headingText = screen.getByText("Mood Mix");
    expect(headingText).toBeInTheDocument();
  });

  test("renders header with correct styles", () => {
    render(<Header />);

    // Check if header has the correct background class
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-white/10");
  });

  test("has sticky positioning", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky");
    expect(header).toHaveClass("top-0");
  });
});
