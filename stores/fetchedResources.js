import { defineStore } from 'pinia';

export const useFetchedResourcesStore = defineStore('fetchedResources', {
  state: () => ({
    dataLayer: [],
    dataTable: [],
    document: [],
    all: [],
  }),
  getters: {
    /**
     * Busca un recurso de acuerdo a su uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto de la capa del geonode.
     */
    findResource: (state) => (uuidToFind, resourceType) => {
      return state[resourceType].find(({ uuid }) => uuid === uuidToFind);
    },
  },
  actions: {
    updateFetchedResources(resourceType, newArray) {
      this[resourceType] = newArray;
    },
  },
});
