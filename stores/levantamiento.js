import { defineStore } from 'pinia';

export const useLevantamientoStore = defineStore('levantamiento', () => {
  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    existenProyectos: ref(false),
    existenParticipantes: ref(false),
    existeFormulario: ref(false),
    proyectos: ref([]),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },

    alternarParticipantes() {
      this.existenParticipantes = !this.existenParticipantes;
    },

    alternarFormulario() {
      this.existeFormulario = !this.existeFormulario;
    },

    guardarProyecto() {
      const proyecto = {
        id: this.proyectos.length + 1,
        nombre: 'Mapa de puntos de basura acumulada',
        institucion: 'CentroGeo',
        autor: 'César Rovelo',
        aportes: 0,
      };

      this.proyectos.push(proyecto);
      this.existenProyectos = true;
    },

    obtenerTotalProyectos() {
      return this.proyectos.length;
    },
  };
});
