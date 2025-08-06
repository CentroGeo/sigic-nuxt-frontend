import { defineStore } from 'pinia';
import ConfiguracioCapa from '~/utils/consulta/ConfiguracioCapa';
import ConfiguracionOtro from '~/utils/consulta/ConfiguracionOtro';

export const useSelectedResources2Store = defineStore('selectedResources2', {
  state: () => ({
    dataLayer: [],
    dataTable: [],
    document: [],
  }),
  getters: {
    /**
     * Devuelve un recurso seleccionado que coincidan con un uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {ConfiguracioCapa} objeto del recursos seleccionado.
     */
    findResource: (state) => (uuidToFind, resourceType) => {
      return state[resourceType].find(({ uuid }) => uuid === uuidToFind);
    },

    /**
     * Devuelde los recursos almacenados en la selección en formato url para el query param.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns
     */
    resourcesAsQueryParam: (state) => (resourceType) => {
      return state[resourceType].map((resource) => `${resource.asQueryParam}`).join(';');
    },

    /**
     * Devuelve la lista de uuids en un arreglo.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<String>}
     */
    resourcesList: (state) => (resourceType) => {
      return state[resourceType].map(({ uuid }) => uuid);
    },

    sortedAscending: (state) => (resourceType) => {
      // sorted ascending, sorted descending
      console.log(resourceType);

      return state[resourceType].sort((a, b) => {
        console.log(a, b);

        return a.posicion - b.posicion;
      });
    },
  },
  actions: {
    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     * @param {String} resourceType tipo de resursos a agregar.
     */
    addFromQueryParam(queryParam, resourceType) {
      // Validar si el queryParam se puede parsear
      if (queryParam === undefined || queryParam === '') return;

      if (resourceType === 'dataLayer') {
        this[resourceType] = queryParam.split(';').map((capa) => new ConfiguracioCapa(capa));
      } else {
        this[resourceType] = queryParam.split(';').map((recurso) => new ConfiguracionOtro(recurso));
      }
    },
    updateResources(resources, resourceType) {
      if (resourceType === 'dataLayer') {
        this[resourceType] = resources.map((uuid, posicion) => {
          return new ConfiguracioCapa({ uuid, posicion });
        });
      } else {
        this[resourceType] = resources.map((uuid) => new ConfiguracionOtro({ uuid }));
      }
      // Seleccionamos el ultimo recurso para tablas y docs
      if (resourceType !== 'dataLayer') {
        const last = this[resourceType].at(-1);
        last?.setSelected(1);
      }
    },
    resetResources(resourceType) {
      this[resourceType] = [];
    },
    removeResource(resourceType, resourceUuid) {
      //Borramos el recurso
      this[resourceType] = this[resourceType].filter((r) => r.uuid !== resourceUuid);
    },
    setSelectedElement(resourceType, resourceUuid) {
      this[resourceType].forEach((element) => {
        if (element.uuid === resourceUuid) {
          element.setSelected(1);
        } else {
          element.setSelected(0);
        }
      });
    },
  },
});
