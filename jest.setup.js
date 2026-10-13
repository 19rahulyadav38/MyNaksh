/* eslint-env jest */
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);
// Reanimated 4.7's native initializer registers a CSS event handler that the
// JS (Jest) backend doesn't implement and throws on. Nothing under test needs it.
jest.mock('react-native-reanimated/src/initializers', () => ({
  initializeReanimatedModule: () => {},
}));
jest.mock('react-native-reanimated/lib/module/initializers', () => ({
  initializeReanimatedModule: () => {},
}));
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));
