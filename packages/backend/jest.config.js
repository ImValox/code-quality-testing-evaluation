module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/server.{js,ts}', '!src/**/*.d.ts'],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/database.js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.{js,ts}'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
  }
};
