import { defineStore } from 'pinia';

export const useLevantamientoStore = defineStore('levantamiento', () => {
  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    existenProyectos: ref(false),
    existenParticipantes: ref(false),
    existeFormulario: ref(false),
    proyectos: ref([]),
    proyectosPublicos: ref([
      {
        id: 1,
        nombre: 'Registro de arte urbano en la ciudad de Mérida, Yucatán',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 16,
      },
      {
        id: 2,
        nombre: 'Mapa de puntos de basura acumulada',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 16,
      },
      {
        id: 3,
        nombre: 'Registro de cruces peatonales peligrosos',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 33,
      },
      {
        id: 4,
        nombre: 'Censo de luminarias en la colonia Jardines del Horizonte',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 121,
      },
    ]),

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

    obtenerTotalProyectosPublicos() {
      return this.proyectosPublicos.length;
    },
  };
});
