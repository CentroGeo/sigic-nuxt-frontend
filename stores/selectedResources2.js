import { defineStore } from 'pinia';

export const useSelectedResources2Store = defineStore('selectedResources2', {
  state: () => ({
      dataLayer: [],
      dataTable: [],
      document: [],
  }),
  getters: {
    /**
     * Devuelde los recursos almacenados en la selección en formato url para el query param.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns
     */
    resourcesAsQueryParam: (state) => (resourceType) => {
      return state[resourceType]
        .map((resource) => `${resource.asQueryParam}`)
        .join(';');
    },

    /**
     * Devuelve la lista de uuids en un arreglo.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<String>}
     */
    resourcesList: (state) => (resourceType) => {
      return state[resourceType].map(({ uuid }) => uuid);
    },
  },
  actions: {
    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     * @param {String} resourceType tipo de resursos a agregar.
     */
    addFromQueryParam(queryParam, resourceType) {
      if (queryParam === undefined) {
        // Validar si el queryParam se puede parsear
        return;
      }

      this[resourceType] = queryParam
        .split(';')
        .map((capa) => new ConfiguracioCapa(capa));
    },
    updateSelectedResources(resources, resourceType) {
      if (resourceType === 'dataLayer') {
        this[resourceType] = resources.map(
          (uuid) => new ConfiguracioCapa({ uuid })
        );
      } else {
        this[resourceType] = resources.map(
          (uuid) => new ConfiguracionOtro({ uuid })
        );
      }
    },
  },
});

class ConfiguracioCapa {
  separador_ = ',';

  /**
   * Devuelve los atributos del query param en un objeto.
   * @param {String} queryParam de un recurso con sus atributos separados por comas (,).
   * @returns {Object}
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
    return [this.uuid, this.estilo || '', this.opacidad, this.visible].join(this.separador_);
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
