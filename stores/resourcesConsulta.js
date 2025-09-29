import { defineStore } from 'pinia';
import { buildUrl, defineGeomType, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

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

  const nthElementsUuids = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  return {
    isLoading: ref(false),
    totals,
    resources,

    resourcesByType(resourceType = storeConsulta.resourceType) {
      return resources[resourceType];
    },
    totalByType(resourceType = storeConsulta.resourceType) {
      return totals[resourceType];
    },
    nthElementsByType(resourceType = storeConsulta.resourceType) {
      return nthElementsUuids[resourceType];
    },

    resetByType(resourceType = storeConsulta.resourceType) {
      totals[resourceType] = 0;
      resources[resourceType] = [];
    },

    async getTotalResources(resourceType = storeConsulta.resourceType) {
      const { gnoxyFetch } = useGnoxyUrl();
      this.isLoading = true;
      const queryParams = {
        //custom: 'true',
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
      //console.log('La url generada: ', url);
      const request = await gnoxyFetch(url.toString());
      //console.log('La solicitud:', request);
      const res = await request.json();
      //console.log('La respuesta:', res);
      totals[resourceType] = res.total;
      this.isLoading = false;
    },

    async fillByCategory(resourceType = storeConsulta.resourceType, pageNum, category) {
      const { gnoxyFetch } = useGnoxyUrl();
      const queryParams = {
        custom: 'true',
        'filter{resource_type}': resourceTypeGeonode[resourceType],
        'filter{category.identifier}': category,
        page: pageNum,
        page_size: 2,
      };
      if (resourceType === 'dataLayer') {
        queryParams['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        //queryParams['filter{subtype.in}'] = ['vector', 'remote'];
        queryParams['filter{subtype.in}'] = 'vector';
      }
      /* if (resourceType === 'document') {
        queryParams['file_extension'] = ['pdf', 'txt'];
      } */
      const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
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

      const data = res.resources;
      resources[resourceType] = [...resources[resourceType], ...data];
    },

    setNthElements(resourceType = storeConsulta.resourceType, uuidsList) {
      nthElementsUuids[resourceType] = uuidsList;
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
