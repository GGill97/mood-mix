// __tests__/mocks/sessionMocks.ts

export const mockSpotifySession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
  },
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
  error: null,
};

export const mockExpiredSession = {
  ...mockSpotifySession,
  expires: new Date(Date.now() - 1000).toISOString(), // Expired
  error: "RefreshAccessTokenError",
};

export const mockEmptySession = null;
