import { defineStore } from 'pinia';
import { buildUrl, defineGeomType, resourceTypeDic } from '~/utils/consulta';

export const useResourcesIAStore = defineStore('resourcesIA', () => {
  const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });
  const selectedResources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  const nthElementsPks = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  return {
    isLoading: ref(false),
    resources,
    selectedResources,
    nthElementsPks,
    /**
     * Función que regresa los recursos según el tipo de recurso con el que se está trabajando
     * @param {String} resourceType
     * @returns {Array}
     */
    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },
    selectedByType(resourceType = storeConsulta.resourceType) {
      return selectedResources[resourceType];
    },
    /**
     * Elimina un recurso de la selección. Si elimina una tabla o doc seleccionado, reselecciona el primero.
     * @param {String} pk del recurso a eliminar.
     * @param {String} resourceType tipo de recurso a consultar.
     */
    removeSelectedByPk(pkToRemove, resourceType = storeConsulta.resourceType) {
      selectedResources[resourceType] = selectedResources[resourceType].filter(
        (resource) => resource.pk !== pkToRemove
      );
    },
    /**
     * Función que regresa un array de pks correspondientes a los enésimos elementos de cada categoría
     * @param {String} resourceType
     * @returns {Array}
     */
    nthElementsByType(resourceType = storeConsulta.resourceType) {
      return nthElementsPks[resourceType];
    },
    /**
     * Elimina todos los elementos de un tipo
     * @param {String} resourceType
     */
    resetByType(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = [];
    },
    resetSelectedByType(resourceType = storeConsulta.resourceType) {
      selectedResources[resourceType] = [];
    },
    /**
     * Hace una petición por recursos especificando el número de página, el número de recursos y los query params que debe llevar
     * @param {String} resourceType
     * @param {Number} pageNum
     * @param {Array} params
     */
    async fetchByCategory(resourceType = storeConsulta.resourceType, pageNum, params) {
      const { gnoxyFetch } = useGnoxyUrl();
      const queryParams = {
        page: pageNum,
        page_size: 2,
        ...params,
      };
      const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, queryParams);
      const request = await gnoxyFetch(url);
      const res = await request.json();

      // Agregamos el tipo de geometría cuando sea necesario
      if (resourceType === 'dataLayer') {
        await Promise.all(
          res.resources.map(async (d) => {
            d.geomType = await defineGeomType(d);
          })
        );
      }
      const datum = res.resources;

      // TODO: Agregar en los query params el filtrado para indicar que recursos con metadatos
      // completos. Borrar la siguiente linea y cambiar data por datum
      const data = datum.filter((d) => d.category);
      resources[resourceType] = [...resources[resourceType], ...data];

      //const data = res.resources;
      //resources[resourceType] = [...resources[resourceType], ...data];
    },
    /**
     * Reescribe la lista de pks correspondientes a los enésimos elementos
     * @param {String} resourceType
     * @param {Array} pksList
     */
    setNthElements(resourceType = storeConsulta.resourceType, pksList) {
      nthElementsPks[resourceType] = pksList;
    },
    /**
     * Solicita el recurso identificado por el pk
     * @param {String} pkToFind
     * @param {String} resourceType
     */
    async fetchResourceByPk(pkToFind) {
      const { gnoxyFetch } = useGnoxyUrl();
      const url = `${config.public.geonodeApi}/sigic-resources/${pkToFind}`;
      const res = await gnoxyFetch(url);
      // TODO: Si la petición falla porque el recurso es privado, eliminarlo de la store de seleccion
      const resource = await res.json();
      return resource.resource;
    },

    /**
     * Solicita todos los recursos de una lista a partir de su pk
     * @param {Array} pkToFind
     * @param {String} resourceType
     */
    async fetchResourcesByPk(resourceType = storeConsulta.resourceType, pkListToFind) {
      const lista = [];
      for (const pk of pkListToFind) {
        const resource = await this.fetchResourceByPk(pk);
        lista.push(resource);
      }
      selectedResources[resourceType] = lista;
    },

    /**
     * Devuelve un recursos que coincida con un pk.
     * @param {String} pk del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto de recursos de geonode.
     */
    findResource(pkToFind, resourceType = storeConsulta.resourceType) {
      return selectedResources[resourceType].find(({ pk }) => pk === pkToFind);
    },
    /**
     * Devuelve una lista de recursos que coincidan con una lista de pks.
     * @param {Array<String>} pks del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<Object>} lista de ojetos de recursos de geonode.
     */
    findResources(pksToFind, resourceType = storeConsulta.resourceType) {
      return selectedResources[resourceType].filter(({ pk }) => pksToFind.includes(pk));
    },
  };
});
