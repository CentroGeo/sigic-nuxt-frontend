import { defineStore } from 'pinia';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';

export const useConsultaStore = defineStore('consulta', () => {
  return {
    resourceType: ref(undefined),

    catalogoColapsado: ref(false),
    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },

    mapExtent: ref(extensionNacional),
    resetMapExtent() {
      this.mapExtent = extensionNacional;
    },

    divisionMapa: ref(undefined),
    activarDivisionMapa() {
      this.divisionMapa = 50;
    },
    desactivarDivisionMapa() {
      this.divisionMapa = undefined;
    },
    divisionMapaActivado() {
      return this.divisionMapa !== undefined && typeof this.divisionMapa === typeof Number();
    },

    contenedorSelectoresDivisionColapsado: ref(true),
  };
});
