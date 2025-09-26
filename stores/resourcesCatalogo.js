import { defineStore } from 'pinia';
import { buildUrl, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useResourcesCatalogoStore = defineStore('resourcesCatalogo', () => {
  const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const totals = reactive({
    [resourceTypeDic.dataLayer]: 0,
    [resourceTypeDic.dataTable]: 0,
    [resourceTypeDic.document]: 0,
  });
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  const latestResources = reactive({
    [resourceTypeDic.dataLayer]: undefined,
    [resourceTypeDic.dataTable]: undefined,
    [resourceTypeDic.document]: undefined,
  });

  return {
    isLoading: ref(false),
    totals,
    resources,
    latestResources,

    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },

    totalByType(resourceType = storeConsulta.resourceType) {
      return totals[resourceType];
    },

    latestByType(resourceType = storeConsulta.resourceType) {
      return latestResources[resourceType];
    },

    resetByType(resourceType = storeConsulta.resourceType) {
      resources[resourceType] = [];
    },
    /**Hace una petición de solo 1 recurso para obtener el total de recursos y el último recurso */
    async getTotalResources(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        custom: 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page_size: 100,
      };
      if (resourceType === 'dataLayer') {
        queryParams['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        //queryParams['filter{subtype.in}'] = ['vector', 'remote'];
        queryParams['filter{subtype.in}'] = 'vector';
      }
      /*  if (resourceType === 'document') {
        queryParams['file_extension'] = ['pdf', 'txt'];
      } */

      const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      console.log('Queremos ver el total: ', res);
      totals[resourceType] = res.total;
      latestResources[resourceType] = res.resources[0];
      this.isLoading = false;
    },
    /**
     *Hace una petición de recursos especificando la página y el número de recursos que se desea traer
     * @param {Object} resourceType
     * @param {Number} pageNum
     * @param {Number} pageSize
     */
    async getResourcesByPage(resourceType = storeConsulta.resourceType, pageNum, pageSize) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        custom: 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page: pageNum,
        page_size: pageSize,
      };
      if (resourceType === 'dataLayer') {
        queryParams['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        //queryParams['filter{subtype.in}'] = ['vector', 'remote'];
        queryParams['filter{subtype.in}'] = 'vector';
      }
      /*  if (resourceType === 'document') {
        queryParams['file_extension'] = ['pdf', 'txt'];
      } */

      const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      resources[resourceType] = res.resources;
      this.isLoading = false;
    },
    /**
     * Devuelve un recursos que coincida con un uuid.
     * @param {String} uuid del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Object} ojeto de recursos de geonode.
     */
    findResource(uuidToFind, resourceType = storeConsulta.resourceType) {
      return resources[resourceType].find(({ uuid }) => uuid === uuidToFind);
    },
    /**
     * Devuelve una lista de recursos que coincidan con una lista de uuids.
     * @param {Array<String>} uuids del catalogo a buscar.
     * @param {String} resourceType tipo de resursos a consultar.
     * @returns {Array<Object>} lista de ojetos de recursos de geonode.
     */
    findResources(uuidsToFind, resourceType = storeConsulta.resourceType) {
      return resources[resourceType].filter(({ uuid }) => uuidsToFind.includes(uuid));
    },
  };
});
