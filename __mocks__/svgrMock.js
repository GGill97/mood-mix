// __mocks__/nextAuthMock.js
export const useSession = jest.fn(() => ({
  data: {
    user: { name: "Test User", email: "test@example.com" },
    expires: "2024-12-31",
  },
  status: "authenticated",
}));
