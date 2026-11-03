const js = require('@eslint/js');
const tailwind = require('eslint-plugin-tailwindcss');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const perfectionist = require('eslint-plugin-perfectionist');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
const path = require('node:path');
const prettier = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: ['build/**', 'coverage/**', 'node_modules/**']
  },
  {
    settings: {
      react: { version: 'detect' },
      tailwindcss: {
        config: path.join(__dirname, 'tailwind.config.js')
      }
    }
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  ...tailwind.configs['flat/recommended'],
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx']
  })),
  {
    files: ['**/*.js', '**/*.jsx'],
    ...tseslint.configs.disableTypeChecked
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    }
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', '**/src/**/*.{js,jsx,ts,tsx}'],
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
      'react-hooks/rules-of-hooks': 'error',
      'tailwindcss/classnames-order': 'error',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'error'
    }
  },
  {
    files: [
      'src/**/*.test.{js,jsx,ts,tsx}',
      'src/setupTests.js',
      '**/src/**/*.test.{js,jsx,ts,tsx}',
      '**/setupTests.js'
    ],
    languageOptions: {
      globals: { ...globals.jest }
    }
  },
  {
    files: ['*.config.js', '**/*.config.js', '__mocks__/**/*.js', '**/__mocks__/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs'
    }
  },
  prettier
];
