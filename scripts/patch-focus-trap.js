#!/usr/bin/env node
// Parche para @centrogeomx/sisdai-componentes useFocusTrap.js
// Bug: Vue 3 llama al setter de un customRef en cada re-render, haciendo que
// iniciaFocusTrap() se ejecute en cada tecla y robe el foco al primer campo.
// Fix: añadir guard de idempotencia en el setter.

const fs = require('fs');
const path = require('path');

const target = path.resolve(
  __dirname,
  '../node_modules/@centrogeomx/sisdai-componentes/src/composables/useFocusTrap.js'
);

if (!fs.existsSync(target)) {
  console.warn('[patch-focus-trap] Archivo no encontrado, omitiendo parche.');
  process.exit(0);
}

const original = `      set(value) {
        $trapEl = value
        value ? iniciaFocusTrap() : terminaFocusTrap()
        trigger()
      },`;

const patched = `      set(value) {
        if ($trapEl === value) return
        $trapEl = value
        value ? iniciaFocusTrap() : terminaFocusTrap()
        trigger()
      },`;

const content = fs.readFileSync(target, 'utf8');

if (content.includes(patched)) {
  console.log('[patch-focus-trap] Parche ya aplicado.');
  process.exit(0);
}

if (!content.includes(original)) {
  console.warn(
    '[patch-focus-trap] Texto original no encontrado; el parche puede estar desactualizado.'
  );
  process.exit(0);
}

fs.writeFileSync(target, content.replace(original, patched), 'utf8');
console.log('[patch-focus-trap] Parche aplicado correctamente.');
