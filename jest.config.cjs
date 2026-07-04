module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.json' }],
  },
  testMatch: ['**/src/**/*.jest.js'],
};
