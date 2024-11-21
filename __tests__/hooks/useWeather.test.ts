// __tests__/hooks/useWeather.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useWeather, type WeatherData } from "@/hooks/useWeather";

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
      },
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
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      })
    );

    const { result } = renderHook(() => useWeather("New York"));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockWeatherData);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/weather?location=${encodeURIComponent("New York")}`
    );
  });

  it("handles API errors", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        statusText: "Not Found",
      })
    );

    const { result } = renderHook(() => useWeather("Invalid City"));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    });
  });

  it("handles network errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useWeather("New York"));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    });
  });

  it("updates weather data when location changes", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockWeatherData, name: "New York" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockWeatherData, name: "London" }),
        })
      );

    const { result, rerender } = renderHook(
      (location: string) => useWeather(location),
      { initialProps: "New York" }
    );

    await waitFor(() => {
      expect(result.current.data?.name).toBe("New York");
    });

    rerender("London");

    await waitFor(() => {
      expect(result.current.data?.name).toBe("London");
    });
  });

  it("clears error on successful fetch", async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Failed"))
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeatherData),
        })
      );

    const { result, rerender } = renderHook(
      (location: string) => useWeather(location),
      { initialProps: "Invalid City" }
    );

    // Wait for error state
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Change location
    rerender("New York");

    // Wait for successful fetch
    await waitFor(() => {
      expect(result.current.data).toEqual(mockWeatherData);
      expect(result.current.error).toBeNull();
    });
  });
});
