import { defineStore } from "pinia";

export const useConsultaStore = defineStore("consulta", {
  state: () => ({ catalogoColapsado: false }),
  actions: {
    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
  },
});
