// tests/components/SearchBar.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "@/components/Search/SearchBar";
import { act } from "react-dom/test-utils";

// Mock fetch for suggestion API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(["New York, NY, USA", "Newark, NJ, USA"]),
  })
) as jest.Mock;

describe("SearchBar", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  // Test 1: Basic Rendering
  test("renders search input and frequent cities", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    // Check search input
    expect(
      screen.getByPlaceholderText("Search for a city...")
    ).toBeInTheDocument();

    // Check frequent cities
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("Los Angeles")).toBeInTheDocument();
    expect(screen.getByText("Chicago")).toBeInTheDocument();
  });

  // Test 2: Input Handling
  test("handles input changes", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    fireEvent.change(input, { target: { value: "New York" } });

    expect(input).toHaveValue("New York");
  });

  // Test 3: Form Submission
  test("handles form submission", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    const form = input.closest("form");

    fireEvent.change(input, { target: { value: "New York" } });
    fireEvent.submit(form!);

    expect(mockOnSearch).toHaveBeenCalledWith("New York");
  });

  // Test 4: Frequent City Selection
  test("handles frequent city selection", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const cityButton = screen.getByText("New York");
    fireEvent.click(cityButton);

    expect(mockOnSearch).toHaveBeenCalledWith("New York, NY, USA");
  });

  // Test 5: Loading State
  test("shows loading state", () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    expect(input).toBeDisabled();

    // Check for loading spinner
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  // Test 6: Suggestions Fetching
  test("fetches and displays suggestions", async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");

    // Type in search input
    await act(async () => {
      fireEvent.change(input, { target: { value: "New" } });
      fireEvent.focus(input);
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/citysuggestions?q=New")
      );
    });
  });
});
