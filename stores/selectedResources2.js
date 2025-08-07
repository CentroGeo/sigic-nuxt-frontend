import { defineStore } from 'pinia';
import { resourceTypeDic } from '~/utils/consulta';
import ConfiguracionOtro from '~/utils/consulta/ConfiguracionOtro';
import SelectedLayer from '~/utils/consulta/SelectedLayer';

export const useSelectedResources2Store = defineStore('selectedResources2', () => {
  const storeConsulta = useConsultaStore();

  const resources = reactive({
    [resourceTypeDic.dataLayer]: {},
    [resourceTypeDic.dataTable]: {},
    [resourceTypeDic.document]: {},
  });

  /**
   * Devuelve un objeto con los recursos seleccionados, el uuid es el key de
   * cada objeto.
   * @returns {Object} objeto de recursos seleccionados.
   */
  function byResourceType() {
    return resources[storeConsulta.resourceType];
  }

  /**
   * Devuelve un recurso seleccionado que coincidan con un uuid.
   * @param {String} uuid del catalogo a buscar.
   * @returns {Object} objeto del recurso seleccionado.
   */
  function byUuid(uuid) {
    return byResourceType()[uuid];
  }

  /**
   * Devuelve la lista de los recursos seleccionados.
   * @returns {Array<Object>} lista de selección.
   */
  function list() {
    return Object.values(byResourceType());
  }

  /**
   * Devuelve la lista de objetos seleccionados ordenados de forma decendente
   * por su posición.
   * @returns {Array<SelectedLayer>}
   */
  function sortedDescending() {
    // sorted ascending, sorted descending
    return list().sort((a, b) => {
      return b.posicion - a.posicion;
    });
  }

  return {
    /**
     * Vacía la selección de todos los recursos seleccionados.
     */
    $reset() {
      resources[resourceTypeDic.dataLayer] = {};
      resources[resourceTypeDic.dataTable] = {};
      resources[resourceTypeDic.document] = {};
    },

    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     */
    addFromQueryParam(queryParam) {
      // Validar si el queryParam se puede parsear
      if (queryParam === undefined || queryParam === '') return;

      if (storeConsulta.resourceType === resourceTypeDic.dataLayer) {
        resources[storeConsulta.resourceType] = queryParam
          .split(';')
          .reverse()
          .reduce((acum, txt, posicion) => {
            const obj = new SelectedLayer(`${txt},${posicion}`);

            return { ...acum, [obj.uuid]: obj };
          }, {});
      } else {
        // this[resourceType] = queryParam.split(';').map((recurso) => new ConfiguracionOtro(recurso));
        resources[storeConsulta.resourceType] = queryParam
          .split(';')
          .reverse()
          .reduce((acum, recurso) => {
            const obj = new ConfiguracionOtro(recurso);

            return { ...acum, [obj.uuid]: obj };
          }, {});
      }
    },

    byUuid,

    /**
     * Cambia la posición de un elemento afectando a los otros. Si se sube una
     * pocisión, al recurso que tenga la nueva posición se le asignará la posición
     * original del uuid.
     * @param {String} uuid del elemento a cabiar posición.
     * @param {Number} addPosition nuemro de posiciones a modificar.
     */
    changePosition(uuid, addPosition) {
      const { posicion } = byUuid(uuid);
      const newPosition = posicion + addPosition;
      const { uuid: uuidB } = list().find(({ posicion }) => posicion === newPosition);

      // console.log('cambiar:', uuid, 'de', posicion, 'a', newPosition);
      // console.log('cambiar:', uuidB, 'de', newPosition, 'a', posicion);
      byUuid(uuid).posicion = newPosition;
      byUuid(uuidB).posicion = posicion;
    },

    list,

    /**
     * Vacía la selección de los recursos seleccionados.
     */
    reset() {
      resources[storeConsulta.resourceType] = {};
    },

    /**
     * Elimina un recurso de la selección.
     * @param {String} uuid del recurso a eliminar.
     */
    removeByUuid(uuid) {
      delete byResourceType()[uuid];
      //Si borramos el recurso seleccionado, marcamos el primero de la lista
/*      if(storeConsulta.resourceType !== resourceTypeDic.dataLayer){
        const remaining = list().filter((r) => r.isSelected === 1)
        if(remaining.length === 0 && list().length > 0){
          this[resourceType][0].setSelected(1)
        }
      } */
    },

    /**
     * Devuelde los recursos almacenados en la selección en formato url para el
     * query param.
     * @returns {String}
     */
    asQueryParam() {
      return sortedDescending()
        .map((resource) => resource.asQueryParam)
        .join(';');
    },

    sortedDescending,

    setSelectedElement(resourceUuid) {
      list().forEach((element) => {
        if (element.uuid === resourceUuid) {
          element.setSelected(1);
        } else {
          element.setSelected(0);
        }
      });
    },

    updateResources(_uuids) {
      if (storeConsulta.resourceType === resourceTypeDic.dataLayer) {
        resources[storeConsulta.resourceType] = _uuids.reduce((acum, uuid, posicion) => {
          const newResource = { [uuid]: byUuid(uuid) };
          if (newResource[uuid]) {
            newResource[uuid].posicion = posicion;
          } else {
            newResource[uuid] = new SelectedLayer({ uuid, posicion });
          }

          return { ...acum, ...newResource };
        }, {});
      } else {
        // this[resourceType] = resources.map((uuid) => new ConfiguracionOtro({ uuid }));
        resources[storeConsulta.resourceType] = _uuids.reduce((acum, uuid, posicion) => {
          return {
            ...acum,
            [uuid]: new ConfiguracionOtro({ uuid, isSelected: _uuids.length === posicion + 1 }),
          };
        }, {});
      }
      // Seleccionamos el ultimo recurso para tablas y docs
      // if (storeConsulta.resourceType !== resourceTypeDic.dataLayer) {
      //   const last = list().at(-1);
      //   last?.setSelected(1);
      // }
    },

    /**
     * Contiene la lista de uuids de los elementos seleccionados en un arreglo.
     * @type {Array<string>}
     */
    uuids: computed(() => Object.keys(byResourceType())),

    visibleOnes() {
      return list().filter((resource) => resource.visible);
    },
    selectedOnes() {
      return list().filter((resource) => resource.isSelected === 1);
    },
  };
});
