import { renderHook, act } from "@testing-library/react";
import useGeolocation from "@/hooks/useGeolocation";

describe("useGeolocation", () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  };

  beforeEach(() => {
    // Reset mock before each test
    mockGeolocation.getCurrentPosition.mockReset();

    // Mock the navigator.geolocation
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should handle successful geolocation request", async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success(mockPosition)
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestGeolocation();
    });

    expect(result.current.latitude).toBe(51.5074);
    expect(result.current.longitude).toBe(-0.1278);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should handle geolocation error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) =>
      error(new Error("Geolocation error"))
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestGeolocation();
    });

    expect(result.current.error).toBe("Unable to retrieve your location");
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should handle unsupported geolocation", async () => {
    // Remove geolocation from navigator
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestGeolocation();
    });

    expect(result.current.error).toBe(
      "Geolocation is not supported by your browser"
    );
    expect(result.current.isLoading).toBeFalsy();
  });
});
