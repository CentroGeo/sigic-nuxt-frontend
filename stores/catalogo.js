import { defineStore } from 'pinia';

export const useCatalogoStore = defineStore('catalogo', () => {
  // const userInfo = reactive({});
  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    // userInfo,
    userInfo: ref({}),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  };
});
