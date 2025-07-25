import { defineStore } from "pinia";

export const useConsultaStore = defineStore("consulta", {
  state: () => ({
    catalogoColapsado: false,
    ajustarExtensionMapa: undefined,
    idNavegacionLateral:
      "navegacionlateral-" + Math.random().toString(36).substring(2),
  }),
  actions: {
    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  },
});
