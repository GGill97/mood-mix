import { renderHook, act } from "@testing-library/react";
import { useLocationManager } from "../../src/hooks/useLocationManager";
import useGeolocation from "../../src/hooks/useGeolocation";
import {
  mockWeatherData,
  mockLocationResponse,
  mockCoordinates,
} from "../../__mocks__/weatherMocks";

// Mock useGeolocation hook
jest.mock("../../src/hooks/useGeolocation", () => () => ({
  isLoading: false,
  requestGeolocation: jest
    .fn()
    .mockResolvedValue({ lat: 37.7749, lon: -122.4194 }),
}));

describe("useLocationManager", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useLocationManager());

    expect(result.current.location).toBe("");
    expect(result.current.locationError).toBeNull();
    expect(result.current.weatherDescription).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  describe("handleLocationSearch", () => {
    it("handles empty search query", async () => {
      const { result } = renderHook(() => useLocationManager());

      await act(async () => {
        await result.current.handleLocationSearch("");
      });

      expect(result.current.location).toBe("");
      expect(result.current.weatherDescription).toBe("");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("successfully fetches weather data", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      const { result } = renderHook(() => useLocationManager());

      await act(async () => {
        await result.current.handleLocationSearch("Test City");
      });

      expect(result.current.location).toBe("Test City");
      expect(result.current.weatherDescription).toBe("clear sky");
      expect(result.current.locationError).toBeNull();
    });

    it("handles API error gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useLocationManager());

      await act(async () => {
        await result.current.handleLocationSearch("Invalid City");
      });

      expect(result.current.locationError).toBe("Failed to fetch weather data");
    });
  });

  describe("handleLocationClick", () => {
    it("successfully gets current location and weather", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLocationResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherData),
        });

      const { result } = renderHook(() => useLocationManager());

      await act(async () => {
        await result.current.handleLocationClick();
      });

      expect(result.current.location).toBe("Test City");
      expect(result.current.weatherDescription).toBe("clear sky");
    });
  });

  describe("handleWeatherUpdate", () => {
    it("updates weather description", () => {
      const { result } = renderHook(() => useLocationManager());

      act(() => {
        result.current.handleWeatherUpdate("sunny");
      });

      expect(result.current.weatherDescription).toBe("sunny");
    });
  });

  describe("error handling", () => {
    it("clears error when starting new search", async () => {
      const { result } = renderHook(() => useLocationManager());

      act(() => {
        result.current.setLocationError("Initial error");
      });

      expect(result.current.locationError).toBe("Initial error");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await act(async () => {
        await result.current.handleLocationSearch("Test City");
      });

      expect(result.current.locationError).toBeNull();
    });
  });
});
