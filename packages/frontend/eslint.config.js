const js = require('@eslint/js');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const perfectionist = require('eslint-plugin-perfectionist');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: ['build/**', 'coverage/**', 'node_modules/**']
  },
  {
    settings: {
      react: { version: 'detect' }
    }
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        module: 'readonly',
        process: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      sourceType: 'module'
    },
    plugins: {
      perfectionist,
      'react-hooks': reactHooks
    },
    rules: {
      'perfectionist/sort-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-jsx-props': ['error', { type: 'natural' }],
      'perfectionist/sort-named-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-objects': ['error', { type: 'natural' }],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error'
    }
  },
  {
    files: ['src/**/*.test.{js,jsx}', 'src/setupTests.js'],
    languageOptions: {
      globals: { ...globals.jest }
    }
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs'
    }
  }
];
