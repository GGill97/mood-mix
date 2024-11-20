// tests/components/layout/SearchSection.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchSection } from "@/components/layout/SearchSection";

// Mock the SearchBar component
jest.mock("@/components/Search/SearchBar", () => {
  return function MockSearchBar({
    onSearch,
    isLoading,
  }: {
    onSearch: (query: string) => void;
    isLoading: boolean;
  }) {
    return (
      <div data-testid="search-bar">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          disabled={isLoading}
          data-testid="search-input"
        />
      </div>
    );
  };
});

// Mock the icons
jest.mock("react-icons/fa", () => ({
  FaMapMarkerAlt: () => <div data-testid="location-icon">Location Icon</div>,
}));

describe("SearchSection", () => {
  const defaultProps = {
    onSearch: jest.fn(),
    onLocationClick: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders search bar and location button", () => {
    render(<SearchSection {...defaultProps} />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /use my location/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("location-icon")).toBeInTheDocument();
  });

  test("handles location button click", () => {
    render(<SearchSection {...defaultProps} />);

    const locationButton = screen.getByRole("button", {
      name: /use my location/i,
    });
    fireEvent.click(locationButton);

    expect(defaultProps.onLocationClick).toHaveBeenCalledTimes(1);
  });

  test("shows loading state correctly", () => {
    render(<SearchSection {...defaultProps} isLoading={true} />);

    const locationButton = screen.getByRole("button", {
      name: /getting location/i,
    });
    expect(locationButton).toBeDisabled();
    expect(locationButton).toHaveClass("disabled:opacity-50");
  });

  test("displays error message when error prop is provided", () => {
    const errorMessage = "Location not found";
    render(<SearchSection {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass("text-red-500");
  });

  test("handles search with loading state", async () => {
    const mockSearch = jest.fn(() => Promise.resolve());
    render(<SearchSection {...defaultProps} onSearch={mockSearch} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "London" } });

    // Check that loading state is managed correctly
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("London");
    });
  });

  test("maintains disabled state while loading", () => {
    render(<SearchSection {...defaultProps} isLoading={true} />);

    const locationButton = screen.getByRole("button", {
      name: /getting location/i,
    });
    const searchInput = screen.getByTestId("search-input");

    expect(locationButton).toBeDisabled();
    expect(searchInput).toBeDisabled();
  });

  test("manages search loading state", async () => {
    // Create a delayed mock search function
    const mockSearch = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<SearchSection {...defaultProps} onSearch={mockSearch} />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "New York" } });

    // Verify that loading state is set during search
    await waitFor(() => {
      expect(searchInput).toBeDisabled();
    });

    // Wait for search to complete
    await waitFor(() => {
      expect(searchInput).not.toBeDisabled();
    });
  });
});
