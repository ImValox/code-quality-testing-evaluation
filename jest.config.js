module.exports = {
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  projects: ['<rootDir>/packages/backend', '<rootDir>/packages/frontend']
};
