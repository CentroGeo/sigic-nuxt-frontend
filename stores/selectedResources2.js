import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { resourceTypeDic } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';
import SelectedResource from '~/utils/consulta/SelectedResource';

export const useSelectedResources2Store = defineStore('selectedResources2', () => {
  const storeConsulta = useConsultaStore();

  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const resources = reactive({
    [resourceTypeDic.dataLayer]: {},
    [resourceTypeDic.dataTable]: {},
    [resourceTypeDic.document]: {},
  });

  /**
   * Devuelve un objeto con los recursos seleccionados, el pks es el key de
   * cada objeto.
   * @param {String} resourceType tipo de recursos a consultar.
   * @returns {Object} objeto de recursos seleccionados.
   */
  function byResourceType(resourceType = storeConsulta.resourceType) {
    return resources[resourceType];
  }

  return {
    /**
     * Vacía la selección de todos los recursos seleccionados.
     * Nota: La función $reset es necesaria para el uso adecuado del store en
     * las dev tools.
     */
    $reset() {
      resources[resourceTypeDic.dataLayer] = {};
      resources[resourceTypeDic.dataTable] = {};
      resources[resourceTypeDic.document] = {};
    },

    /**
     * Agrega un nuevo elemento a los recursos seleccionados.
     * @param {SelectedResource} newResource instancia del recurso.
     * @param {String} resourceType tipo de recurso a agregar.
     */
    add(newResource, resourceType = storeConsulta.resourceType) {
      if (this.byPk(newResource.pk, resourceType)) {
        this.removeByPk(newResource.pk, resourceType);
      }

      // Si el nuevo recurso no tiene posición asignada
      if (isNaN(newResource.posicion)) {
        newResource.posicion = this.list(resourceType).length;
      }

      // Cuando no se agrega una capa (tablas y documentos)
      if (resourceType !== resourceTypeDic.dataLayer) {
        // Si el nuevo recurso tiene visibilidad, quitar visibiidad a los demás
        if (newResource.visible) {
          this.setOnlyOneVisible(newResource.pk, resourceType);
        }
      }

      resources[resourceType][newResource.pk] = newResource;
    },

    /**
     * Agrega a la selección los recurson que encuentre en el queryParam.
     * @param {String} queryParam de los recursos separados por punto y coma (;).
     * @param {String} resourceType tipo de recursos a agregar.
     */
    addFromQueryParam(queryParam, resourceType = storeConsulta.resourceType) {
      // Validar si el queryParam se puede parsear
      if (queryParam === undefined || queryParam === '') return;

      const ClassToUse =
        resourceType === resourceTypeDic.dataLayer ? SelectedLayer : SelectedResource;
      queryParam
        .split(';')
        .reverse()
        .forEach((txt, position) => this.add(new ClassToUse(`${txt},${position}`), resourceType));
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
     * Devuelve un recurso seleccionado que coincidan con un pk.
     * @param {String} pk del catalogo a buscar.
     * @param {String} resourceType tipo de recurso a consultar.
     * @returns {Object} objeto del recurso seleccionado.
     */
    byPk(pk, resourceType = storeConsulta.resourceType) {
      return byResourceType(resourceType)[pk];
    },

    /**
     * Cambia la posición de un elemento afectando a los otros. Si se sube una
     * pocisión, al recurso que tenga la nueva posición se le asignará la posición
     * original del pk.
     * @param {String} pk del elemento a cabiar posición.
     * @param {Number} addPosition nuemro de posiciones a modificar.
     */
    changePosition(pk, addPosition) {
      const { posicion } = this.byPk(pk);
      const newPosition = posicion + addPosition;
      const { pk: pkB } = this.list().find(({ posicion }) => posicion === newPosition);

      // console.log('cambiar:', pk, 'de', posicion, 'a', newPosition);
      this.byPk(pk).posicion = newPosition;
      // console.log('cambiar:', pkB, 'de', newPosition, 'a', posicion);
      this.byPk(pkB).posicion = posicion;
    },

    /**
     * Devuelve el último objeto que esté visible.
     * @returns {SelectedResource}
     */
    lastVisible() {
      return this.sortedDescending().find((resource) => resource.visible);
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
     * Elimina un recurso de la selección. Si elimina una tabla o doc seleccionado, reselecciona el primero.
     * @param {String} pk del recurso a eliminar.
     * @param {String} resourceType tipo de recurso a consultar.
     */
    removeByPk(pkToRemove, resourceType = storeConsulta.resourceType) {
      const wasVisible = this.byPk(pkToRemove, resourceType).visible;

      delete byResourceType(resourceType)[pkToRemove];

      // Reasignar las posiciones cada que se elimine un elemento
      this.sortedAscending(resourceType).forEach(({ pk }, idx) => {
        this.byPk(pk, resourceType).posicion = idx;
      });

      // Cuando no se elimine una capa
      if (resourceType !== resourceTypeDic.dataLayer) {
        // Si se elimina el recurso seleccionado, marca el último de la lista
        if (wasVisible && this.list(resourceType).length > 0) {
          this.setOnlyOneVisible(this.sortedDescending(resourceType)[0].pk, resourceType);
        }
      }
    },

    /**
     * Vacía la selección de los recursos seleccionados.
     * @param {String} resourceType tipo de recurso a modificar.
     */
    reset(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = {};
    },

    /**
     * Asigna visivilidad solo a un elemento de la selección.
     * @param {String} pk del recurso a modificar.
     * @param {String} resourceType tipo de recurso a modificar.
     */
    setOnlyOneVisible(pkToChange, resourceType = storeConsulta.resourceType) {
      this.list(resourceType).forEach(({ pk }) => {
        this.byPk(pk, resourceType).visible = Boolean(pkToChange === pk);
      });
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
     * Actualiza los elementos seleccionados de acuerdo a una lista de pks,
     * si detecta que se deben quitar elementos los elimina, si detecta que debe
     * agregar elementos los agrega. Los pks que no deba quitar o agregar, los
     * conserva.
     * @param {Array<String>} newpks
     * @param {String} resourceType tipo de recursos a modificar.
     */
    updateByPks(newPks, resourceType = storeConsulta.resourceType) {
      const { news, olds } = arrayNewsOlds(this.pks, newPks);

      olds.forEach((pk) => this.removeByPk(pk, resourceType));

      const ClassToUse =
        resourceType === resourceTypeDic.dataLayer ? SelectedLayer : SelectedResource;
      news.forEach((pk) => this.add(new ClassToUse({ pk }), resourceType));
    },

    /**
     * Contiene la lista de pks de los elementos seleccionados en un arreglo.
     * @type {Array<string>}
     */
    pks: computed(() => Object.keys(byResourceType())),
  };
});

/**
 * Devuelve las listas de elementos no encontrados en dos listas.
 * @param {Array<String>} list1
 * @param {Array<String>} list2
 * @returns {Object} objeto con dos propiedades:
 * - `news` -> elementos de list2 no entontrados en list1
 * - `olds` -> elementos de list1 no entontrados en list2
 */
function arrayNewsOlds(list1, list2) {
  const news = list2.filter((item) => !list1.includes(item));
  const olds = list1.filter((item) => !list2.includes(item));

  return { news, olds };
}
