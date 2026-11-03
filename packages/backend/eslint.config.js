const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-n');
const perfectionist = require('eslint-plugin-perfectionist');
const unicorn = require('eslint-plugin-unicorn').default;
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  unicorn.configs.recommended,
  perfectionist.configs['recommended-natural'],
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/src/**/*.ts']
  })),
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked
  },
  {
    files: ['**/*.ts', '**/src/**/*.ts'],
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
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs'
    },
    rules: {
      'n/no-missing-import': 'off',
      'n/no-unpublished-require': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'unicorn/filename-case': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-this-outside-of-class': 'off',
      'unicorn/prefer-module': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/src/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['src/server.js', '**/src/server.js'],
    rules: {
      'n/no-process-exit': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    files: ['tests/**/*.js', 'tests/**/*.ts', '**/tests/**/*.js', '**/tests/**/*.ts'],
    languageOptions: {
      globals: globals.jest
    }
  },
  {
    files: [
      'eslint.config.js',
      '**/eslint.config.js',
      'tests/**/*.js',
      'tests/**/*.ts',
      '**/tests/**/*.js',
      '**/tests/**/*.ts'
    ],
    rules: {
      'n/no-unpublished-require': 'off'
    }
  },
  prettier
];
