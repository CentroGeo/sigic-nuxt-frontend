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
     * Devuelde los recursos almacenados en la selección en formato url para el query param.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns
     */
    resourcesAsQueryParam: (state) => (resourceType) => {
      return state
        .resourcesList(resourceType)
        .map((uuid) => `${uuid},${state.selectedResources[resourceType][uuid].asQueryParam}`)
        .join(';');
    },

    /**
     * Devuelve la lista de uuids en un arreglo.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<String>}
     */
    resourcesList: (state) => (resourceType) => {
      return Object.keys(state.selectedResources[resourceType]);
    },
  },
  actions: {
    addFromQueryParam(queryParam, resourceType) {
      console.log('addFromQueryParam', queryParam, resourceType);

      const x = queryParam?.split(';').map((capa) => {
        return new ConfiguracioCapa(capa);
      });

      console.log(x);
    },
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
  separador_ = ',';

  /**
   * Devuelve los atributos del query param en un objeto
   * @param {String} queryParam
   * @returns
   */
  fromQueryParam(queryParam) {
    const [uuid, estilo, opacidad, visible] = queryParam.split(this.separador_);
    return { uuid, estilo, opacidad, visible };
  }

  constructor(opciones = {}) {
    const { estilo, opacidad, uuid, visible } =
      typeof opciones === 'string' ? this.fromQueryParam(opciones) : opciones;

    this.estilo = estilo || undefined;
    this.opacidad = opacidad || 1;
    this.uuid = uuid || '';
    this.visible = visible || 1;
  }

  get asQueryParam() {
    // return `${this.estilo || ''},${this.opacidad},${this.visible}`;
    return [this.estilo || '', this.opacidad, this.visible].join(this.separador_);
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
