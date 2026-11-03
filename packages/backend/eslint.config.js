const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-n');
const perfectionist = require('eslint-plugin-perfectionist');
const unicorn = require('eslint-plugin-unicorn').default;
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['coverage/**', 'node_modules/**']
  },
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  unicorn.configs.recommended,
  perfectionist.configs['recommended-natural'],
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs'
    },
    rules: {
      'n/no-missing-import': 'error',
      'n/no-unpublished-require': 'error',
      // Express identifie un error handler par ses 4 paramètres
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Le projet utilise des noms en camelCase (userController.js...)
      'unicorn/filename-case': 'off',
      // "req", "res", "err" sont des noms courants avec Express
      'unicorn/name-replacements': 'off',
      // sqlite3 renvoie null, on ne peut pas l'éviter
      'unicorn/no-null': 'off',
      // sqlite3 expose lastID via this dans ses callbacks
      'unicorn/no-this-outside-of-class': 'off',
      // Le backend est en CommonJS (require), pas en modules ES
      'unicorn/prefer-module': 'off'
    }
  },
  {
    files: ['src/server.js'],
    rules: {
      'n/no-process-exit': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.jest
    }
  },
  {
    files: ['eslint.config.js', 'tests/**/*.js'],
    rules: {
      'n/no-unpublished-require': 'off'
    }
  },
  prettier
];
