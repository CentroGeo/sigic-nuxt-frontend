import { defineStore } from "pinia";
// TODO: intentar hacer un módulo para cada set proyectos,fuentes,contextos,chats
export const useIAStore = defineStore("ia", {
  state: () => ({
    existenProyectos: false,
    existeContexto: false,
  }),
  actions: {
    crearProyecto() {
      this.existenProyectos = true;
    },
    crearContexto() {
      this.existeContexto = true;
    },
  },
});
