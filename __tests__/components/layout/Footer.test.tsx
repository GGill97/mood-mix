// tests/components/layout/Footer.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  test("renders footer content", () => {
    render(<Footer />);

    // Check for main text
    expect(screen.getByText("Made with")).toBeInTheDocument();
    expect(screen.getByText("by Mood Mix")).toBeInTheDocument();
  });

  test("renders navigation links", () => {
    render(<Footer />);

    // Check navigation links
    const aboutLink = screen.getByRole("link", { name: /about/i });
    const contactLink = screen.getByRole("link", { name: /contact/i });

    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute("href", "/about");

    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  test("displays copyright text", () => {
    render(<Footer />);

    // Check for copyright text
    const copyright = screen.getByText(/© 2024 Mood Mix/);
    expect(copyright).toBeInTheDocument();
  });
});
