import { defineStore } from "pinia";

export const useCatalogoStore = defineStore("catalogo", {
  state: () => ({
    files: [],
    catalogoColapsado: false,
    idNavegacionLateral:
      "navegacionlateral-" + Math.random().toString(36).substring(2),
  }),
  actions: {
    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  },
});
