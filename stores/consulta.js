import { defineStore } from 'pinia';

export const useConsultaStore = defineStore('consulta', () => {
  const catalogoColapsado = ref(false);
  const idNavegacionLateral = ref('navegacionlateral-' + Math.random().toString(36).substring(2));
  const resourceType = ref(undefined);

  return {
    catalogoColapsado,
    idNavegacionLateral,
    resourceType,

    alternarCatalogoColapsable: () => (catalogoColapsado.value = !catalogoColapsado.value),
  };
});
