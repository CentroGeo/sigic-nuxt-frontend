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
    raiseIndex(currentSelection, resourceType) {
      let currentIndex = this.selectedResources[resourceType].findIndex(
        (resource) => resource.uuid === currentSelection.uuid
      );
      if (currentIndex !== 0) {
        // Guardamos lo que hay en la posición previa
        let anterior = this.selectedResources[resourceType][currentIndex - 1];
        // Subimos el index del elemento seleccionado
        this.selectedResources[resourceType][currentIndex - 1] =
          currentSelection;
        // Guardamos en el index actual el valor del previo
        this.selectedResources[resourceType][currentIndex] = anterior;
      } else {
        console.log("primer elemento");
      }
    },
    lowerIndex(currentSelection, resourceType) {
      let currentIndex = this.selectedResources[resourceType].findIndex(
        (resource) => resource.uuid === currentSelection.uuid
      );
      if (currentIndex !== this.selectedResources[resourceType].length - 1) {
        // Guardamos lo que hay en la posición siguiente
        let siguiente = this.selectedResources[resourceType][currentIndex + 1];
        // Subimos el index del elemento seleccionado
        this.selectedResources[resourceType][currentIndex + 1] =
          currentSelection;
        // Guardamos en el index actual el valor del previo
        this.selectedResources[resourceType][currentIndex] = siguiente;
      } else {
        console.log("ultimo elemento");
      }
    },
  },
});
