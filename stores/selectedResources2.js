import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { resourceTypeDic } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';
import SelectedResource from '~/utils/consulta/SelectedResource';

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
   * @param {String} resourceType tipo de resursos a consultar.
   * @returns {Object} objeto de recursos seleccionados.
   */
  function byResourceType(resourceType = storeConsulta.resourceType) {
    return resources[resourceType];
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
     * Agrega un nuevo elemento a los recursos seleccionados.
     * @param {SelectedResource} newResource instancia del recurso.
     * @param {String} resourceType tipo de resurso a agregar.
     */
    add(newResource, resourceType = storeConsulta.resourceType) {
      if (this.byUuid(newResource.uuid, resourceType)) {
        this.removeByUuid(newResource.uuid, resourceType);
      }

      // Si el nuevo recurso no tiene posición asignada
      if (isNaN(newResource.posicion)) {
        newResource.posicion = this.list(resourceType).length;
      }

      // Cuando no se agrega una capa
      if (resourceType !== resourceTypeDic.dataLayer) {
        // Si el nuevo recurso tiene visibilidad, quitar visibiidad a los demás
        if (newResource.visible) {
          this.list(resourceType).forEach(({ uuid }) => {
            this.byUuid(uuid, resourceType).visible = false;
          });
        }
      }

      resources[resourceType][newResource.uuid] = newResource;
    },

    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     */
    addFromQueryParam(queryParam) {
      // Validar si el queryParam se puede parsear
      if (queryParam === undefined || queryParam === '') return;

      const ClassToUse =
        storeConsulta.resourceType === resourceTypeDic.dataLayer ? SelectedLayer : SelectedResource;

      queryParam
        .split(';')
        .reverse()
        .forEach((txt, position) => this.add(new ClassToUse(`${txt},${position}`)));
    },

    /**
     * Devuelve un recurso seleccionado que coincidan con un uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resurso a consultar.
     * @returns {Object} objeto del recurso seleccionado.
     */
    byUuid(uuid, resourceType = storeConsulta.resourceType) {
      return byResourceType(resourceType)[uuid];
    },

    /**
     * Cambia la posición de un elemento afectando a los otros. Si se sube una
     * pocisión, al recurso que tenga la nueva posición se le asignará la posición
     * original del uuid.
     * @param {String} uuid del elemento a cabiar posición.
     * @param {Number} addPosition nuemro de posiciones a modificar.
     */
    changePosition(uuid, addPosition) {
      const { posicion } = this.byUuid(uuid);
      const newPosition = posicion + addPosition;
      const { uuid: uuidB } = this.list().find(({ posicion }) => posicion === newPosition);

      // console.log('cambiar:', uuid, 'de', posicion, 'a', newPosition);
      // console.log('cambiar:', uuidB, 'de', newPosition, 'a', posicion);
      this.byUuid(uuid).posicion = newPosition;
      this.byUuid(uuidB).posicion = posicion;
    },

    /**
     * Devuelve la lista de los recursos seleccionados.
     * @param {String} resourceType tipo de recursos a consultar.
     * @returns {Array<Object>} lista de selección.
     */
    list(resourceType = storeConsulta.resourceType) {
      return Object.values(byResourceType(resourceType));
    },

    /**
     * Vacía la selección de los recursos seleccionados.
     */
    reset() {
      resources[storeConsulta.resourceType] = {};
    },

    /**
     * Elimina un recurso de la selección. Si elimina una tabla o doc seleccionado, reselecciona el primero.
     * @param {String} uuid del recurso a eliminar.
     */
    removeByUuid(uuidToRemove, resourceType = storeConsulta.resourceType) {
      const wasVisible = this.byUuid(uuidToRemove, resourceType).visible;

      delete byResourceType(resourceType)[uuidToRemove];

      // Reasignar las posiciones cada que se elimine un elemento
      this.sortedAscending(resourceType).forEach(({ uuid }, idx) => {
        this.byUuid(uuid, resourceType).posicion = idx;
      });

      // Cuando no se elimine una capa
      if (resourceType !== resourceTypeDic.dataLayer) {
        // Si se elimina el recurso seleccionado, marca el último de la lista
        if (wasVisible && this.list(resourceType).length > 0) {
          this.byUuid(this.sortedDescending(resourceType)[0].uuid, resourceType).visible = true;
        }
      }
    },

    /**
     * Devuelde los recursos almacenados en la selección en formato url para el
     * query param.
     * @returns {String}
     */
    asQueryParam() {
      return this.sortedDescending()
        .map((resource) => resource.asQueryParam)
        .join(';');
    },

    /**
     * Devuelve la lista de objetos seleccionados ordenados de forma ascendente.
     * por su posición.
     * @param {String} resourceType tipo de recursos a consultar.
     * @returns {Array<SelectedLayer>}
     */
    sortedAscending(resourceType = storeConsulta.resourceType) {
      return this.list(resourceType).sort((a, b) => {
        return a.posicion - b.posicion;
      });
    },

    /**
     * Devuelve la lista de objetos seleccionados ordenados de forma decendente.
     * por su posición.
     * @param {String} resourceType tipo de recursos a consultar.
     * @returns {Array<SelectedLayer>}
     */
    sortedDescending(resourceType = storeConsulta.resourceType) {
      return this.list(resourceType).sort((a, b) => {
        return b.posicion - a.posicion;
      });
    },

    /**
     *
     * @param {String} uuid
     */
    setOnlyOneVisible(uuid) {
      this.uuids.forEach((_uuid) => (this.byUuid(_uuid).visible = _uuid === uuid));
    },

    /**
     * Actualiza los elementos seleccionados de acuerdo a una lista de uuids,
     * si detecta que se deben quitar elementos los elimina, si detecta que debe
     * agregar elementos los agrega. Los uuids que no deba quitar o agregar, los
     * conserva.
     * @param {Array<String>} newUuids
     * @param {String} resourceType tipo de recursos a modificar.
     */
    updateByUuids(newUuids, resourceType = storeConsulta.resourceType) {
      const { news, olds } = arrayNewsOlds(this.uuids, newUuids);

      olds.forEach((uuid) => this.removeByUuid(uuid, resourceType));

      const ClassToUse =
        resourceType === resourceTypeDic.dataLayer ? SelectedLayer : SelectedResource;
      news.forEach((uuid) => this.add(new ClassToUse({ uuid }), resourceType));
    },

    /**
     * Contiene la lista de uuids de los elementos seleccionados en un arreglo.
     * @type {Array<string>}
     */
    uuids: computed(() => Object.keys(byResourceType())),

    /** D E P R E C A D O: si solo necesita un elemento, usar: lastVisible()
     * Devuelve solo los recursos que son visibles.
     * @returns {Array<Object>}
     */
    // visibleOnes() {
    //   return this.sortedDescending().filter((resource) => resource.visible);
    // },

    /**
     * Devuelve el último objeto que esté visible.
     * @returns {SelectedResource}
     */
    lastVisible() {
      return this.sortedDescending().find((resource) => resource.visible);
    },
  };
});

/**
 * Devuelve las listas de elementos no encontrados en dos listas.
 * @param {Array<String>} list1
 * @param {Array<String>} list2
 * @returns {Object} objeto con dos propiedades: `news` -> elementos del list2
 * no entontrados en list1 y `olds` -> elementos del list1 no entontrados en
 * list2
 */
function arrayNewsOlds(list1, list2) {
  const news = list2.filter((item) => !list1.includes(item));
  const olds = list1.filter((item) => !list2.includes(item));

  return { news, olds };
}
