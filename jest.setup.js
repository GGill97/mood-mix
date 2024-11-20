// jest.setup.js
require("@testing-library/jest-dom");

// Basic matchMedia mock
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };
