import { defineStore } from 'pinia';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';

export const useConsultaStore = defineStore('consulta', () => {
  return {
    catalogoColapsado: ref(false),
    mapExtent: ref(extensionNacional),
    resourceType: ref(undefined),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },
    resetMapExtent() {
      this.mapExtent = extensionNacional;
    },
  };
});
