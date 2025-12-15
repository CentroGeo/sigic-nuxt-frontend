import { defineStore } from 'pinia';

export const useCatalogoStore = defineStore('catalogo', () => {
  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  };
});
