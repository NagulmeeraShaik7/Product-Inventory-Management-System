// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'mjs', 'json'],
  testMatch: [
    '**/*.test.js', 
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true,
};