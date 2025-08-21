import { defineStore } from 'pinia';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';

export const useConsultaStore = defineStore('consulta', () => {
  const catalogoColapsado = ref(false);
  const idNavegacionLateral = ref('navegacionlateral-' + Math.random().toString(36).substring(2));
  const mapExtent = ref(extensionNacional);
  const resourceType = ref(undefined);

  return {
    catalogoColapsado,
    idNavegacionLateral,
    mapExtent,
    resourceType,

    alternarCatalogoColapsable() {
      catalogoColapsado.value = !catalogoColapsado.value;
    },
    resetMapExtent() {
      mapExtent.value = extensionNacional;
    },
  };
});
