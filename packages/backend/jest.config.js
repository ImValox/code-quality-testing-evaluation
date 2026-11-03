module.exports = {
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/database.js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js']
};
