const js = require('@eslint/js');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-n');
const unicorn = require('eslint-plugin-unicorn').default;
const perfectionist = require('eslint-plugin-perfectionist');

module.exports = [
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  unicorn.configs.recommended,
  perfectionist.configs['recommended-natural'],
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'n/no-missing-import': 'error',
      'n/no-unpublished-require': 'error',
      // Le projet utilise des noms en camelCase (userController.js...)
      'unicorn/filename-case': 'off',
      // Le backend est en CommonJS (require), pas en modules ES
      'unicorn/prefer-module': 'off',
      // "req", "res", "err" sont des noms courants avec Express
      'unicorn/prevent-abbreviations': 'off',
      // sqlite3 renvoie null, on ne peut pas l'éviter
      'unicorn/no-null': 'off',
    },
  },
];
