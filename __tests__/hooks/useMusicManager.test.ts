import { renderHook, act } from "@testing-library/react";
import { useMusicManager } from "@/hooks/useMusicManager";

describe("useMusicManager", () => {
  // Test initial state
  it("initializes with empty states", () => {
    const { result } = renderHook(() => useMusicManager());

    expect(result.current.selectedGenres).toEqual([]);
    expect(result.current.moodGenres).toEqual([]);
    expect(result.current.displayTitle).toBe("");
  });

  // Test setters
  it("updates selectedGenres correctly", () => {
    const { result } = renderHook(() => useMusicManager());
    const newGenres = ["rock", "pop"];

    act(() => {
      result.current.setSelectedGenres(newGenres);
    });

    expect(result.current.selectedGenres).toEqual(newGenres);
  });

  it("updates moodGenres correctly", () => {
    const { result } = renderHook(() => useMusicManager());
    const newGenres = ["jazz", "blues"];

    act(() => {
      result.current.setMoodGenres(newGenres);
    });

    expect(result.current.moodGenres).toEqual(newGenres);
  });

  it("updates displayTitle correctly", () => {
    const { result } = renderHook(() => useMusicManager());
    const newTitle = "New Music Mix";

    act(() => {
      result.current.setDisplayTitle(newTitle);
    });

    expect(result.current.displayTitle).toBe(newTitle);
  });

  // Test handleMoodAnalysis
  it("handles mood analysis correctly", () => {
    const { result } = renderHook(() => useMusicManager());

    const mockAnalysis = {
      genres: ["electronic", "ambient"],
      weatherMood: "rainy",
      response: "Test response",
      moodAnalysis: "Test mood analysis",
      displayTitle: "Rainy Day Mix",
    };

    act(() => {
      result.current.handleMoodAnalysis(mockAnalysis);
    });

    expect(result.current.moodGenres).toEqual(mockAnalysis.genres);
    expect(result.current.selectedGenres).toEqual(mockAnalysis.genres);
    expect(result.current.displayTitle).toBe(mockAnalysis.displayTitle);
  });

  // Test multiple state updates
  it("handles multiple state updates correctly", () => {
    const { result } = renderHook(() => useMusicManager());

    act(() => {
      result.current.setSelectedGenres(["rock"]);
      result.current.setMoodGenres(["jazz"]);
      result.current.setDisplayTitle("First Title");
    });

    expect(result.current.selectedGenres).toEqual(["rock"]);
    expect(result.current.moodGenres).toEqual(["jazz"]);
    expect(result.current.displayTitle).toBe("First Title");

    // Update with mood analysis
    const mockAnalysis = {
      genres: ["pop", "dance"],
      weatherMood: "sunny",
      response: "New response",
      moodAnalysis: "New mood analysis",
      displayTitle: "Sunny Day Mix",
    };

    act(() => {
      result.current.handleMoodAnalysis(mockAnalysis);
    });

    expect(result.current.selectedGenres).toEqual(mockAnalysis.genres);
    expect(result.current.moodGenres).toEqual(mockAnalysis.genres);
    expect(result.current.displayTitle).toBe(mockAnalysis.displayTitle);
  });

  // Test edge cases
  it("handles empty arrays in mood analysis", () => {
    const { result } = renderHook(() => useMusicManager());

    const mockAnalysis = {
      genres: [],
      weatherMood: "sunny",
      response: "Test response",
      moodAnalysis: "Test mood analysis",
      displayTitle: "Empty Mix",
    };

    act(() => {
      result.current.handleMoodAnalysis(mockAnalysis);
    });

    expect(result.current.moodGenres).toEqual([]);
    expect(result.current.selectedGenres).toEqual([]);
    expect(result.current.displayTitle).toBe("Empty Mix");
  });

  it("maintains state independence between renders", () => {
    const { result: result1 } = renderHook(() => useMusicManager());
    const { result: result2 } = renderHook(() => useMusicManager());

    act(() => {
      result1.current.setSelectedGenres(["rock"]);
      result2.current.setSelectedGenres(["jazz"]);
    });

    expect(result1.current.selectedGenres).toEqual(["rock"]);
    expect(result2.current.selectedGenres).toEqual(["jazz"]);
  });
});
