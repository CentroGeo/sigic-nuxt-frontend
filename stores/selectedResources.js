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
    shownFiles: {
      dataLayer: undefined,
      dataTable: undefined,
      document: undefined,
    },
  }),
  actions: {
    addResource(resourceType, resource) {
      if (
        !this.selectedResources[resourceType]?.some(
          (r) => r.uuid === resource.uuid
        )
      ) {
        this.selectedResources[resourceType].unshift(resource);
      }
      //console.log(this.selectedResources);
    },
    removeResource(resourceType, currentResource) {
      //Borramos el recurso
      this.selectedResources[resourceType] = this.selectedResources[
        resourceType
      ].filter((r) => r.uuid !== currentResource.uuid);
      //console.log(this.selectedResources);
      if (this.selectedResources[resourceType].length > 0) {
        // Si no se queda vacía, seleccionamos el documento posterior
        this.shownFiles[resourceType] = this.selectedResources[resourceType][0];
        console.log(this.shownFiles[resourceType]);
      } else {
        // Si la lista queda vacía, ajustamos el valor del recurso seleccionado
        this.shownFiles[resourceType] = undefined;
      }
    },
    resetResource(resourceType) {
      this.selectedResources[resourceType] = [];
    },
    updateFilteredResources(resourceType, newArray) {
      this.filteredResources[resourceType] = newArray;
    },
    setShownFile(resourceType, resource) {
      this.shownFiles[resourceType] = resource;
      //console.log("cambio la seleccion", this.shownFiles[resourceType].uuid);
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
