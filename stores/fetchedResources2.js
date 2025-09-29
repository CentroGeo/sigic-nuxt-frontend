import { defineStore } from 'pinia';
import { resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useFetchedResources2Store = defineStore('fetchedResources2', () => {
  //const config = useRuntimeConfig();
  const storeConsulta = useConsultaStore();
  /**
   * Almacenamiento reactivo de los recursos seleccionados.
   */
  const resources = reactive({
    [resourceTypeDic.dataLayer]: [],
    [resourceTypeDic.dataTable]: [],
    [resourceTypeDic.document]: [],
  });

  /**
   * Devuelve un objeto con los recursos seleccionados, el uuid es el key de
   * cada objeto.
   * @param {String} resourceType tipo de recursos a consultar.
   * @returns {Object} objeto de recursos seleccionados.
   */
  function byResourceType(resourceType = storeConsulta.resourceType) {
    // if (resourceType === resourceTypeDic.dataLayer) {
    //   const noGeometryExtent = [-1, -1, 0, 0].join('');

    //   return resources[resourceTypeDic.dataTable].fillter(
    //     U S A R -> isGeometricExtension
    //     (resource) => resource.extent.coords.join('') !== noGeometryExtent
    //   );
    // }

    return resources[resourceType];
  }

  return {
    isLoading: ref(false),
    resources,
    byResourceType,

    // all: computed(() => Object.values(resources).flat()),
    all: computed(() => [
      ...resources[resourceTypeDic.dataLayer],
      ...resources[resourceTypeDic.dataTable].filter(
        (resource) => !isGeometricExtension(resource.extent)
      ),
      ...resources[resourceTypeDic.document],
    ]),

    checkFilling(resourceType = storeConsulta.resourceType) {
      // if (resources[resourceType].length > 0) return;
      // comenté la anterior para forzar la recarga cada vez, pues no se refleja los recursos nuevos
      this.fill(resourceType);
    },

    async fill(resourceType = storeConsulta.resourceType) {
      const { data } = useAuth();
      //console.log('la data', data.value);
      this.isLoading = true;

      const options = {
        query: {
          custom: 'true',
          'filter{resource_type}': resourceTypeGeonode[resourceType],
          //page_size: 50,
          // agregar filtros
        },
        headers: {},
      };

      if (resourceType === 'dataLayer') {
        options.query['extent_ne'] = '[-1,-1,0,0]';
      }
      if (resourceType === 'dataTable') {
        options.query['filter{subtype.in}'] = ['vector', 'remote'];
      }
      if (resourceType === 'document') {
        options.query['file_extension'] = ['pdf', 'txt'];
      }

      if (data.value?.accessToken) {
        options.headers.token = data.value?.accessToken;
      } else {
        options.headers.token = 'sin-token';
      }

      const { error, allResults } = await $fetch('/api/catalogo', options);

      if (error !== undefined) {
        alert('Vuelve a iniciar sesión');
        return;
      }
      resources[resourceType] = allResults;
      // T E M P O R A L
      /*       resources[resourceType] = await validacionTemporal(
        allResults,
        resourceType,
        config.public.geonodeUrl
      ); */
      this.isLoading = false;

      // Prueba de consumo de recursos paginado y usando gnoxy
      /*       
      const api = `${config.public.geonodeApi}/resources`;
      const { gnoxyFetch } = useGnoxyUrl();const url = buildUrl(api, options.query);
      const res = await gnoxyFetch(url);
      const { resources: allResults } = await res.json();
      const datum = await validacionTemporal(allResults, resourceType, config.public.geonodeUrl);
      resources[resourceType] = [...resources[resourceType], ...datum]; */
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

    concatResources(resourceType = storeConsulta.resourceType, newResources) {
      resources[resourceType] = [...resources[resourceType], ...newResources];
    },
  };
});

/* async function validacionTemporal(resources, resourceType, proxyURL) {
  if (resourceType === resourceTypeDic.document) {
    return resources;
  }
  if (resourceType === resourceTypeDic.dataLayer) {
    // Revisamos si los servicios remotos tienen tabla
    const locals = resources.filter((resource) => resource.sourcetype === 'LOCAL');
    let remotes = resources.filter((resource) => resource.sourcetype === 'REMOTE');
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
