// __tests__/hooks/useWeather.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWeather } from "@/hooks/useWeather";
import type { WeatherData } from "@/hooks/useWeather";

describe("useWeather", () => {
  const mockWeatherData: WeatherData = {
    name: "New York",
    main: {
      temp: 72.5,
      humidity: 65,
      feels_like: 73.2,
    },
    weather: [
      {
        description: "clear sky",
        icon: "01d",
      }
    ],
    wind: {
      speed: 5.2,
    },
    visibility: 10000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("returns initial state with no location", () => {
    const { result } = renderHook(() => useWeather(""));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches weather data when location is provided", async () => {
    const successPromise = Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => successPromise);

    const { result } = renderHook(() => useWeather("New York"));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockWeatherData);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/weather?location=${encodeURIComponent("New York")}`
    );
  });

  it("handles API errors", async () => {
    const errorPromise = Promise.resolve({
      ok: false,
      statusText: "Not Found"
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => errorPromise);

    const { result } = renderHook(() => useWeather("Invalid City"));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    });
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network error");
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useWeather("New York"));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    });
  });

  it("updates weather data when location changes", async () => {
    const newYorkData = { ...mockWeatherData, name: "New York" };
    const londonData = { ...mockWeatherData, name: "London" };

    // First fetch returns New York data
    const firstPromise = Promise.resolve({
      ok: true,
      json: () => Promise.resolve(newYorkData),
    });

    // Second fetch returns London data
    const secondPromise = Promise.resolve({
      ok: true,
      json: () => Promise.resolve(londonData),
    });

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => secondPromise);

    const { result, rerender } = renderHook((props) => useWeather(props), {
      initialProps: "New York",
    });

    await waitFor(() => {
      expect(result.current.data?.name).toBe("New York");
    });

    rerender("London");

    await waitFor(() => {
      expect(result.current.data?.name).toBe("London");
    });
  });

  it("cancels previous fetch when location changes quickly", async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockWeatherData, name: "New York" }),
        });
      }, 100);
    });

    const fastPromise = Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ...mockWeatherData, name: "London" }),
    });

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => slowPromise)
      .mockImplementationOnce(() => fastPromise);

    const { result, rerender } = renderHook((props) => useWeather(props), {
      initialProps: "New York",
    });

    rerender("London");

    await waitFor(() => {
      expect(result.current.data?.name).toBe("London");
    });
  });

  it("clears error on successful fetch", async () => {
    // Mock fetch implementations
    const firstFetchReject = jest.fn().mockRejectedValueOnce(new Error("Failed"));
    const secondFetchResolve = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    });
  
    (global.fetch as jest.Mock)
      .mockImplementationOnce(firstFetchReject)
      .mockImplementationOnce(secondFetchResolve);
  
    const { result, rerender } = renderHook(
      (location: string) => useWeather(location),
      { initialProps: "Invalid City" }
    );
  
    // Wait for error state to be set
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    }, { timeout: 1000 });
  
    // Verify initial error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  
    // Rerender with valid city
    act(() => {
      rerender("New York");
    });
  
    // Wait for successful fetch with increased timeout
    await waitFor(
      () => {
        const currentState = result.current;
        expect(currentState.data).toEqual(mockWeatherData);
        expect(currentState.error).toBeNull();
      },
      { timeout: 2000, interval: 100 }
    );
  });
)
