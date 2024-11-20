// __tests__/test-utils.tsx
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import userEvent from "@testing-library/user-event";
import type { RenderOptions } from "@testing-library/react";

// Common mocks
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Common test data
export const mockSession = {
  expires: "1",
  user: { id: "1", email: "test@test.com", name: "Test User" },
  accessToken: "mock-access-token",
};

// Extended wrapper props interface
interface WrapperProps {
  children: React.ReactNode;
}

// Extended render options interface
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: any;
  router?: Partial<ReturnType<typeof useRouter>>;
}

// Custom render function with providers
function customRender(
  ui: React.ReactElement,
  {
    session = mockSession,
    router = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: WrapperProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  }

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper to simulate API responses
export const mockApiResponse = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

// Helper to simulate API errors
export const mockApiError = (status = 500, message = "API Error") => {
  return Promise.reject(new Error(message));
};

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Common test data generators
export const generateMockTrack = (overrides = {}) => ({
  id: "track-1",
  name: "Test Track",
  artists: [{ name: "Test Artist" }],
  uri: "spotify:track:test",
  preview_url: "https://test.com/preview",
  external_urls: {
    spotify: "https://open.spotify.com/track/test",
  },
  ...overrides,
});

export const generateMockWeatherData = (overrides = {}) => ({
  name: "Test City",
  main: {
    temp: 72,
    feels_like: 70,
    humidity: 50,
  },
  weather: [
    {
      description: "clear sky",
      icon: "01d",
    },
  ],
  wind: {
    speed: 5,
  },
  visibility: 10000,
  ...overrides,
});

// Re-export testing library utilities
export * from "@testing-library/react";
export { customRender as render };
