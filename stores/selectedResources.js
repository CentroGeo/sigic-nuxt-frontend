import { defineStore } from 'pinia';

export const useSelectedResourcesStore = defineStore('selectedResources', {
  state: () => ({
    selectedResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
      todos: [],
    },
    filteredResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
      todos: [],
    },
    shownFiles: {
      dataLayer: {
        centro: [-102.53775, 23.6254],
        acercamiento: 4.818118060279814,
        opacity: {},
        visibility: {},
      },
      dataTable: undefined,
      document: undefined,
      todos: undefined,
    },
  }),
  actions: {
    addResource(resourceType, resource) {
      if (!this.selectedResources[resourceType]?.some((r) => r.uuid === resource.uuid)) {
        this.selectedResources[resourceType].unshift(resource);
      }
    },
    removeResource(resourceType, currentResource) {
      //Borramos el recurso
      this.selectedResources[resourceType] = this.selectedResources[resourceType].filter(
        (r) => r.uuid !== currentResource.uuid
      );

      if (this.selectedResources[resourceType].length > 0) {
        // Si no se queda vacía, seleccionamos el documento posterior
        this.shownFiles[resourceType] = this.selectedResources[resourceType][0];
      } else {
        // Si la lista queda vacía, ajustamos el valor del recurso seleccionado
        this.shownFiles[resourceType] = undefined;
      }
    },
    resetResource(resourceType) {
      this.selectedResources[resourceType] = [];
      this.shownFiles[resourceType] = null;
    },
    updateFilteredResources(resourceType, newArray) {
      // actualiza los recursos filtrados
      this.filteredResources[resourceType] = newArray;
    },
    setShownFile(resourceType, resource) {
      this.shownFiles[resourceType] = resource;
      //console.log("cambio la seleccion", this.shownFiles[resourceType].uuid);
    },
    raiseIndex(currentSelection, resourceType) {
      const currentIndex = this.selectedResources[resourceType].findIndex(
        (resource) => resource.uuid === currentSelection.uuid
      );
      if (currentIndex !== 0) {
        // Guardamos lo que hay en la posición previa
        const anterior = this.selectedResources[resourceType][currentIndex - 1];
        // Subimos el index del elemento seleccionado
        this.selectedResources[resourceType][currentIndex - 1] = currentSelection;
        // Guardamos en el index actual el valor del previo
        this.selectedResources[resourceType][currentIndex] = anterior;
      } else {
        console.warn('primer elemento');
      }
    },
    lowerIndex(currentSelection, resourceType) {
      const currentIndex = this.selectedResources[resourceType].findIndex(
        (resource) => resource.uuid === currentSelection.uuid
      );
      if (currentIndex !== this.selectedResources[resourceType].length - 1) {
        // Guardamos lo que hay en la posición siguiente
        const siguiente = this.selectedResources[resourceType][currentIndex + 1];
        // Subimos el index del elemento seleccionado
        this.selectedResources[resourceType][currentIndex + 1] = currentSelection;
        // Guardamos en el index actual el valor del previo
        this.selectedResources[resourceType][currentIndex] = siguiente;
      } else {
        console.warn('ultimo elemento');
      }
    },
    updateLayerOpacity(alternate, value) {
      this.shownFiles.dataLayer.opacity[alternate] = value / 100;
      console.log('cambio store opacidad', this.shownFiles.dataLayer.opacity);
    },
    updateLayerVisibility(alternate, value) {
      this.shownFiles.dataLayer.visibility[alternate] = value;
      console.log(this.shownFiles.dataLayer.visibility);
    },
    setMapViewParams(centroArg, acercamientoArg) {
      this.shownFiles.dataLayer.centro = centroArg;
      this.shownFiles.dataLayer.acercamiento = acercamientoArg;
      console.log('cambiaron centro y zoom: ', this.shownFiles.dataLayer);
    },
  },
});
