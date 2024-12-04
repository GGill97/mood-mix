// jest.config.js
module.exports = {
  // Tell Jest to use jsdom for testing React components
  testEnvironment: "jsdom",

  // Handle Next.js specific features
  moduleNameMapper: {
    // Handle the @ import alias
    "^@/(.*)$": "<rootDir>/src/$1",
    "^../../mocks/(.*)$": "<rootDir>/mocks/$1",
    // Handle CSS imports
    "\\.(css|less|scss)$": "identity-obj-proxy",
    // Handle image imports
    "\\.(jpg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Setup file location
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Files to transform
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};
