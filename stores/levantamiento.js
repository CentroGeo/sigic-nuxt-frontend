import { defineStore } from 'pinia';

export const useLevantamientoStore = defineStore('levantamiento', () => {
  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  };
});
