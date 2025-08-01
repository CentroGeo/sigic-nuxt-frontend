// eslint.config.mjs
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default withNuxt([
  configPrettier,
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: {
      prettier,
    },
    languageOptions: {
      globals: {
        defineNuxtPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
      },
    },
    ignores: [
      '**/.git',
      '**/.nuxt',
      '**/coverage',
      '**/deprecated',
      '**/dist',
      '**/node_modules',
      '**/package-lock.json',
      '**/package.json',
    ],
    rules: {
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-prototype-builtins': 'error',
      'no-new': 0,
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'prettier/prettier': 'error',
    },
  },
]);
