import { defineStore } from "pinia";

export const useSelectedResourcesStore = defineStore("selectedResources", {
  state: () => ({
    selectedResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
    },
    filteredResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
    },
  }),
  actions: {
    addResource(resourceType, file) {
      if (
        !this.selectedResources[resourceType]?.some((r) => r.uuid === file.uuid)
      ) {
        this.selectedResources[resourceType].unshift(file);
      }
      //console.log(this.selectedResources);
    },
    removeResource(resourceType, file) {
      this.selectedResources[resourceType] = this.selectedResources[
        resourceType
      ].filter((r) => r.uuid !== file.uuid);
      //console.log(this.selectedResources);
    },
    resetResource(resourceType) {
      this.selectedResources[resourceType] = [];
    },
    updateFilteredResources(resourceType, newArray) {
      this.filteredResources[resourceType] = newArray;
    },
  },
});
