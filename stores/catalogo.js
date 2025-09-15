import { defineStore } from 'pinia';

export const useCatalogoStore = defineStore('catalogo', () => {
  return {
    files: [],
    catalogoColapsado: false,
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    metadatos: {
      title: '',
      abstract: '',
    },

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  };
});
