import { defineStore } from 'pinia';

export const useFetchedResourcesStore = defineStore('fetchedResources', {
  state: () => ({
      dataLayer: [],
      dataTable: [],
      document: [],
      all: [],
  
  }),
  actions: {
    updateFetchedResources(resourceType, newArray) {
      this[resourceType] = newArray;
    }, 
  },
});
