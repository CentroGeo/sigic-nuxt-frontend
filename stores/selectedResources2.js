import { defineStore } from 'pinia';

export const useSelectedResources2Store = defineStore('selectedResources2', {
  state: () => ({
    filteredResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
    },
    selectedResources: {
      dataLayer: {},
      dataTable: {},
      document: {},
    },
  }),
  getters: {
    /**
     * Devuelve la lista de uuids en un arreglo.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<String>}
     */
    resourcesList: (state) => (resourceType) => {
      return Object.keys(state.selectedResources[resourceType]);
    },

    /**
     * Devuelde los recursos almacenados en la selección en formato url para el query param.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns
     */
    resourcesAsQueryParam: (state) => (resourceType) => {
      return state
        .resourcesList(resourceType)
        .map((uuid) => `${uuid},${state.selectedResources[resourceType][uuid].queryParam}`)
        .join(';');
    },
  },
  actions: {
    updateFilteredResources(resourceType, newArray) {
      this.filteredResources[resourceType] = newArray;
    },
    updateSelectedResources(resources, resourceType) {
      if (resourceType === 'dataLayer') {
        this.selectedResources[resourceType] = resources.reduce(
          (obj, capa) => ({ ...obj, [capa]: new ConfiguracioCapa() }),
          {}
        );
      } else {
        this.selectedResources[resourceType] = resources.reduce(
          (obj, capa) => ({ ...obj, [capa]: new ConfiguracionOtro() }),
          {}
        );
      }
    },
  },
});

class ConfiguracioCapa {
  constructor() {
    this.estilo = undefined;
    this.opacidad = 0.5;
    this.visible = 1;
  }

  get queryParam() {
    return `${this.estilo || ''},${this.opacidad},${this.visible}`;
  }
}
class ConfiguracionOtro {
  constructor() {
    this.isSelected = false;
  }

  get queryParam() {
    return ``;
  }
}
