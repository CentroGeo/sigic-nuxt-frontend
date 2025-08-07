import { defineStore } from 'pinia';
import ConfiguracioCapa from '~/utils/consulta/ConfiguracioCapa';
import ConfiguracionOtro from '~/utils/consulta/ConfiguracionOtro';

export const useSelectedResources2Store = defineStore('selectedResources2', () => {
  const storeConsulta = useConsultaStore();

  const resources = reactive({
    dataLayer: {},
    dataTable: {},
    document: {},
  });

  function resourcesByType(resourceType = storeConsulta.resourceType) {
    return resources[resourceType];
  }

  function resource(uuid) {
    return resourcesByType()[uuid];
  }

  return {
    changePosition(uuid, addPosition) {
      const { posicion } = resource(uuid);
      const newPosition = posicion + addPosition;
      const { uuid: uuidB } = Object.values(resourcesByType()).find(
        ({ posicion }) => posicion === newPosition
      );

      // console.log('cambiar:', uuid, 'de', posicion, 'a', newPosition);
      // console.log('cambiar:', uuidB, 'de', newPosition, 'a', posicion);
      resource(uuid).posicion = newPosition;
      resource(uuidB).posicion = posicion;
    },

    addFromQueryParam: () => undefined,
    findResource: () => ({}),

    removeResource(uuid) {
      //Borramos el recurso
      // this[resourceType] = this[resourceType].filter((r) => r.uuid !== resourceUuid);
      delete resourcesByType()[uuid];
    },
    resource,
    resources: resourcesByType,
    resourcesAsQueryParam: () => undefined,
    resourcesList() {
      return Object.keys(resourcesByType());
    },

    sortedDescending() {
      // sorted ascending, sorted descending
      return Object.values(resourcesByType()).sort((a, b) => {
        return b.posicion - a.posicion;
      });
    },

    setSelectedElement(_, resourceUuid) {
      Object.values(resourcesByType()).forEach((element) => {
        if (element.uuid === resourceUuid) {
          element.setSelected(1);
        } else {
          element.setSelected(0);
        }
      });
    },

    updateResources(uuids) {
      if (storeConsulta.resourceType === 'dataLayer') {
        resources[storeConsulta.resourceType] = uuids.reduce((acum, uuid, posicion) => {
          return { ...acum, [uuid]: new ConfiguracioCapa({ uuid, posicion }) };
        }, {});
      } else {
        // this[resourceType] = resources.map((uuid) => new ConfiguracionOtro({ uuid }));
        resources[storeConsulta.resourceType] = uuids.reduce((acum, uuid) => {
          return { ...acum, [uuid]: new ConfiguracionOtro({ uuid }) };
        }, {});
      }
      // Seleccionamos el ultimo recurso para tablas y docs
      if (storeConsulta.resourceType !== 'dataLayer') {
        // const last = this[resourceType].at(-1);
        const last = Object.values(resourcesByType()).at(-1);
        last?.setSelected(1);
      }
    },
  };
});

export const _useSelectedResources2Store_ = {
  state: () => ({
    dataLayer: [],
    dataTable: [],
    document: [],
  }),
  getters: {
    /**
     * Devuelve un recurso seleccionado que coincidan con un uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {ConfiguracioCapa} objeto del recursos seleccionado.
     */
    findResource: (state) => (uuidToFind, resourceType) => {
      return state[resourceType].find(({ uuid }) => uuid === uuidToFind);
    },

    /**
     * Devuelde los recursos almacenados en la selección en formato url para el query param.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns
     */
    resourcesAsQueryParam: (state) => (resourceType) => {
      return state[resourceType].map((resource) => `${resource.asQueryParam}`).join(';');
    },

    /**
     * Devuelve la lista de uuids en un arreglo.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<String>}
     */
    resourcesList: (state) => (resourceType) => {
      return state[resourceType].map(({ uuid }) => uuid);
    },

    sortedAscending: (state) => (resourceType) => {
      // sorted ascending, sorted descending
      // console.log(resourceType);

      return state[resourceType].sort((a, b) => {
        // console.log(a, b);

        return a.posicion - b.posicion;
      });
    },
  },
  actions: {
    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     * @param {String} resourceType tipo de resursos a agregar.
     */
    addFromQueryParam(queryParam, resourceType) {
      // Validar si el queryParam se puede parsear
      if (queryParam === undefined || queryParam === '') return;

      if (resourceType === 'dataLayer') {
        this[resourceType] = queryParam.split(';').map((capa) => new ConfiguracioCapa(capa));
      } else {
        this[resourceType] = queryParam.split(';').map((recurso) => new ConfiguracionOtro(recurso));
      }
    },
    updateResources(resources, resourceType) {
      if (resourceType === 'dataLayer') {
        this[resourceType] = resources.map((uuid, posicion) => {
          return new ConfiguracioCapa({ uuid, posicion });
        });
      } else {
        this[resourceType] = resources.map((uuid) => new ConfiguracionOtro({ uuid }));
      }
      // Seleccionamos el ultimo recurso para tablas y docs
      if (resourceType !== 'dataLayer') {
        const last = this[resourceType].at(-1);
        last?.setSelected(1);
      }
    },
    resetResources(resourceType) {
      this[resourceType] = [];
    },
    removeResource(resourceType, resourceUuid) {
      //Borramos el recurso
      this[resourceType] = this[resourceType].filter((r) => r.uuid !== resourceUuid);
    },
    setSelectedElement(resourceType, resourceUuid) {
      this[resourceType].forEach((element) => {
        if (element.uuid === resourceUuid) {
          element.setSelected(1);
        } else {
          element.setSelected(0);
        }
      });
    },
  },
};
