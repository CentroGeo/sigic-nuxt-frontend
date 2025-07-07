import { defineStore } from "pinia";

export const useSelectedResourcesStore = defineStore("selectedResources", {
  state: () => ({
    selectedResources: {
      dataset: [],
      document: [],
    },
  }),
  actions: {
    addResource(resourceType, layer) {
      if (
        !this.selectedResources[resourceType]?.some(
          (r) => r.uuid === layer.uuid
        )
      ) {
        this.selectedResources[resourceType].unshift(layer);
      }
      //console.log(this.selectedResources);
    },
    removeResource(resourceType, layer) {
      this.selectedResources[resourceType] = this.selectedResources[
        resourceType
      ].filter((r) => r.uuid !== layer.uuid);
      //console.log(this.selectedResources);
    },
    resetResource(resourceType) {
      this.selectedResources[resourceType] = [];
    },
  },
});
