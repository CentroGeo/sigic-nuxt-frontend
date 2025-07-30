module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'google',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'max-len': ['error', { code: 100 }],
    'prettier/prettier': 'error'
  },
};
