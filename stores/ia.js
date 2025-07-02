import { defineStore } from "pinia";

export const useIAStore = defineStore("ia", {
  state: () => ({ existenProyectos: false, existeContexto: false }),
  actions: {
    crearProyecto() {
      this.existenProyectos = true;
    },
    crearContexto() {
      this.existeContexto = true;
    },
  },
});
