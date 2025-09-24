import { defineStore } from 'pinia';
import { buildUrl, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useResourcesConsultaStore = defineStore('resourcesConsulta', () => {
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

  function byResourceType(resourceType = storeConsulta.resourceType) {
    return resources[resourceType];
  }

  return {
    isLoading: ref(false),
    totals,
    resources,
    byResourceType,
    async getTotalResources(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();

      const queryParams = {
        custom: 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        // TODO: Cambiar este valor por un 1
        page_size: 100,
      };
      if (resourceType === 'dataLayer') {
        queryParams['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        queryParams['file_extension'] = ['pdf', 'txt'];
      }

      const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
      const request = await gnoxyFetch(url);
      const res = await request.json();
      totals[resourceType] = res.total;
    },

    async fill(resourceType = storeConsulta.resourceType, pageNum) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        custom: 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        page: pageNum,
        page_size: 20,
      };
      if (resourceType === 'dataLayer') {
        queryParams['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        queryParams['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        queryParams['file_extension'] = ['pdf', 'txt'];
      }
      const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
      const request = await gnoxyFetch(url);
      const res = await request.json();
      const data = res.resources;
      //const filteredResources = await validacionTemporal(data, storeConsulta.resourceType);
      resources[resourceType] = [...resources[resourceType], ...data];
      //console.log('Elementos en la store:', resources[resourceType].length);
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

    nthElement(resourceType = storeConsulta.resourceType, index) {
      const indexDict = {};
      const uuuidList = resources[resourceType].map((d) => d.uuid);
      for (let i = 0; i < uuuidList.length; i++) {
        indexDict[i] = uuuidList[i];
      }
      return indexDict[index];
    },
  };
});

/* async function validacionTemporal(resources, resourceType) {
  const config = useRuntimeConfig();
  const proxyURL = config.public.geonodeUrl;
  let datum;

  if (resourceType === resourceTypeDic.document) {
    // Filtramos los txt y pdfs
    datum = resources.filter((resource) =>
      resource.links.some(
        (link) =>
          link.link_type === 'uploaded' &&
          (link.name.endsWith('.pdf') || link.name.endsWith('.txt'))
      )
    );
    return datum;
  }
  if (resourceType === resourceTypeDic.dataLayer) {
    const noGeometryExtent = [-1, -1, 0, 0];
    datum = resources.filter(
      (resource) =>
        !resource.extent.coords.every((value, index) => value === noGeometryExtent[index])
    );

    // Revisamos si los servicios remotos tienen tabla
    const locals = datum.filter((resource) => resource.sourcetype === 'LOCAL');
    let remotes = datum.filter((resource) => resource.sourcetype === 'REMOTE');
    const filterRemotes = await Promise.all(
      remotes.map(async (resource) => {
        return { resourceValue: resource, resourceHasWms: await hasWMS(resource, 'map', proxyURL) };
      })
    );
    remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
    return locals.concat(remotes);
  }
  if (resourceType === resourceTypeDic.dataTable) {
    // Revisamos si los servicios remotos tienen tabla
    const locals = resources.filter((resource) => resource.sourcetype === 'LOCAL');
    let remotes = resources.filter((resource) => resource.sourcetype === 'REMOTE');
    const filterRemotes = await Promise.all(
      remotes.map(async (resource) => {
        return {
          resourceValue: resource,
          resourceHasWms: await hasWMS(resource, 'table', proxyURL),
        };
      })
    );
    remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
    return locals.concat(remotes);
  }
} */
