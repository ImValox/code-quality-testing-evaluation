/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js', '!src/setupTests.js', '!src/test/**'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ico|jpe?g|png|svg|webp)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // jsdom + API Web natives de Node (fetch, TextEncoder, streams…) nécessaires à MSW
  testEnvironment: 'jest-fixed-jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'],
  // Certaines dépendances de MSW ne sont publiées qu'en ESM (.mjs) : elles doivent passer par Babel
  transformIgnorePatterns: ['/node_modules/(?!(until-async/|.+\\.mjs$))'],
  transform: {
    '^.+\\.m?jsx?$': 'babel-jest'
  }
};
