import { defineStore } from 'pinia';

export const useSelectedResources2Store = defineStore('selectedResources2', {
  state: () => ({
    filteredResources: {
      dataLayer: [],
      dataTable: [],
      document: [],
    },
    selectedResources:{
      dataLayer: {},
      dataTable: {},
      document: {},
    }
  }),
  getters: {
/*     resourcesList: ({ capas }) => Object.keys(capas),
 */    
    resourcesList: (state) => (resourceType) => {
      return Object.keys(state.selectedResources[resourceType])
    }
/*     capasComoQueryParam: (state) =>
      state.listaCapas.map((capa) => `${capa},${state.capas[capa].queryParam}`).join(';'), */
  },
  actions: {
    updateFilteredResources(resourceType, newArray) {
      this.filteredResources[resourceType] = newArray;
    },
    updateSelectedResources(resources, resourceType) {
      if(resourceType === 'dataLayer'){
      this.selectedResources[resourceType] = resources.reduce((obj, capa) => ({ ...obj, [capa]: new ConfiguracioCapa() }), {});
      }else{
      this.selectedResources[resourceType] = resources.reduce((obj, capa) => ({ ...obj, [capa]: new ConfiguracionOtro() }), {});
      }
      console.log(resourceType, this.selectedResources[resourceType])
    },
/*     actualizarCapas(capas) {
      this.capas = capas.reduce((obj, capa) => ({ ...obj, [capa]: new ConfiguracioCapa() }), {});
    }, */
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
    return `${this.estilo || ''},${this.opacidad},${this.visible}`;
  }
}
