import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/Search/SearchBar";

describe("SearchBar", () => {
  // Test 1: Initial Render
  it("renders search input and frequent cities", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    // Check if search input exists
    expect(
      screen.getByPlaceholderText("Search for a city...")
    ).toBeInTheDocument();

    // Check if frequent cities are rendered
    const frequentCities = screen.getAllByRole("button");
    expect(frequentCities).toHaveLength(5); // We have 5 frequent cities
  });

  // Test 2: Input Change and Suggestions
  it("shows suggestions when typing", async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    await userEvent.type(input, "new");

    // Check if suggestions appear - specifically in the dropdown list
    await waitFor(() => {
      const suggestionsList = screen.getByRole("list");
      const suggestions = within(suggestionsList).getByText("New York");
      expect(suggestions).toBeInTheDocument();
    });
  });

  // Test 3: Suggestion Click
  it("handles suggestion click correctly", async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    await userEvent.type(input, "new");

    // Find suggestion specifically in the dropdown list
    await waitFor(() => {
      const suggestionsList = screen.getByRole("list");
      const suggestion = within(suggestionsList).getByText("New York");
      fireEvent.click(suggestion);
    });

    expect(mockOnSearch).toHaveBeenCalledWith("New York");
  });

  // Test 4: Form Submission
  it("handles form submission", async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    await userEvent.type(input, "Boston");

    const form = input.closest("form");
    fireEvent.submit(form!);

    expect(mockOnSearch).toHaveBeenCalledWith("Boston");
  });

  // Test 5: Frequent City Click
  it("handles frequent city click", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    // Find Seattle specifically in the frequent cities section
    const frequentCities = screen.getAllByRole("button");
    const seattleButton = frequentCities.find(
      (button) => button.textContent === "Seattle"
    );
    fireEvent.click(seattleButton!);

    expect(mockOnSearch).toHaveBeenCalledWith("Seattle");
  });

  // Test 6: Suggestion List Hiding
  it("hides suggestions on blur", async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Search for a city...");
    await userEvent.type(input, "new");

    // Check suggestions appear in the dropdown
    await waitFor(() => {
      const suggestionsList = screen.getByRole("list");
      expect(suggestionsList).toBeInTheDocument();
    });

    // Blur input
    fireEvent.blur(input);

    // Wait for suggestions to disappear
    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});
