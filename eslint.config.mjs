// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Your custom configs here
    files: ['**/*.{js,mjs,cjs,vue}'],
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
      // requiere el uso de === y !==
      eqeqeq: 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],

      'no-debugger': 'warn',

      // No permitir llamar a algunos métodos Object.prototype directamente en los objetos
      'no-prototype-builtins': 'error',

      // impide nuevos operadores fuera de asignaciones o comparaciones
      'no-new': 0,

      'no-unused-vars': 'error',

      // Requerir declaraciones constantes para variables que nunca se reasignan después de ser declaradas
      'prefer-const': 'error',
    },
  }
)
