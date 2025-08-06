import { defineStore } from 'pinia';

export const useFetchedResourcesStore = defineStore('fetchedResources', {
  state: () => ({
    dataLayer: [],
    dataTable: [],
    document: [],
    all: [],
    isLoading: false,
  }),
  getters: {
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
    /**
     *
     * @param {String} resourceType
     * @param {Array<Object>} newArray
     */
    updateFetchedResources(resourceType, newArray) {
      this[resourceType] = newArray;
    },
  },
});
