import { renderHook, act } from "@testing-library/react";
import useGeolocation from "../../src/hooks/useGeolocation";

describe("useGeolocation", () => {
  const originalGeolocation = global.navigator.geolocation;

  beforeEach(() => {
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };
  });

  afterEach(() => {
    global.navigator.geolocation = originalGeolocation;
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.requestGeolocation).toBe("function");
  });

  it("successfully gets geolocation", async () => {
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (successCallback) => successCallback(mockPosition)
    );

    const { result } = renderHook(() => useGeolocation());

    let locationResult;
    await act(async () => {
      locationResult = await result.current.requestGeolocation();
    });

    expect(locationResult).toEqual({
      lat: mockPosition.coords.latitude,
      lon: mockPosition.coords.longitude,
    });

    expect(result.current.latitude).toBe(mockPosition.coords.latitude);
    expect(result.current.longitude).toBe(mockPosition.coords.longitude);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("handles geolocation not supported", async () => {
    delete (global.navigator as any).geolocation;

    const { result } = renderHook(() => useGeolocation());

    let locationResult;
    await act(async () => {
      locationResult = await result.current.requestGeolocation();
    });

    expect(locationResult).toBeNull();
    expect(result.current.error).toBe(
      "Geolocation is not supported by your browser"
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("handles geolocation error", async () => {
    const mockError = new Error("Geolocation error");
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (_, errorCallback) => errorCallback(mockError)
    );

    const { result } = renderHook(() => useGeolocation());

    let locationResult;
    await act(async () => {
      locationResult = await result.current.requestGeolocation();
    });

    expect(locationResult).toBeNull();
    expect(result.current.error).toBe("Unable to retrieve your location");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets and clears loading state during request", async () => {
    let resolvePosition: (value: unknown) => void;
    const positionPromise = new Promise((resolve) => {
      resolvePosition = resolve;
    });

    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (successCallback) => {
        positionPromise.then(() => {
          successCallback(mockPosition);
        });
      }
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      // Start the geolocation request
      const requestPromise = result.current.requestGeolocation();

      // Wait a tick for state to update
      await Promise.resolve();

      // Now check loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve the position
      resolvePosition!(undefined);

      // Wait for the request to complete
      await requestPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.latitude).toBe(mockPosition.coords.latitude);
  });

  it("handles error state correctly", async () => {
    const mockError = new Error("Geolocation error");
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (_, errorCallback) => errorCallback(mockError)
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestGeolocation();
    });

    expect(result.current.error).toBe("Unable to retrieve your location");
    expect(result.current.isLoading).toBe(false);
  });
});
