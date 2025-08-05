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
     * Devuelve un recurso de acuerdo a su uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto del recurso de geonode.
     */
    findResource: (state) => (uuidToFind, resourceType) => {
      return state[resourceType].find(({ uuid }) => uuid === uuidToFind);
    },

    /**
     * Devuelve una lista de recursos que coincidan con una lista de uuids.
     * @param {Array<String>} uuids del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<Object>} lista de ojetos de recursos de geonode.
     */
    findResources: (state) => (uuidsToFind, resourceType) => {
      return state[resourceType].filter(({ uuid }) => uuidsToFind.includes(uuid));
    },
  },
  actions: {
    updateFetchedResources(resourceType, newArray) {
      this[resourceType] = newArray;
    },
  },
});
