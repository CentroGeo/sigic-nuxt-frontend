import { defineStore } from 'pinia';
import { hasWMS, resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

export const useFetchedResources2Store = defineStore('fetchedResources2', () => {
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
      if (resources[resourceType].length > 0) return;
      this.fill(resourceType);
    },

    async fill(resourceType = storeConsulta.resourceType) {
      const { data } = useAuth();
      this.isLoading = true;

      const options = {
        query: {
          //options.query['custom'] = 'true';
          'filter{resource_type}': resourceTypeGeonode[resourceType],
          page_size: 50,
          // agregar filtros
        },
        headers: {},
      };

      /*  if (resourceType === 'dataLayer') {
        options.query['extent_ne'] = '[-1,-1,0,0]';
      } */
      if (resourceType === 'dataTable') {
        options.query['filter{subtype.in}'] = ['vector', 'remote'];
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

      // T E M P O R A L
      resources[resourceType] = await validacionTemporal(allResults, resourceType);
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

async function validacionTemporal(resources, resourceType) {
  if (resourceType === resourceTypeDic.document) {
    //Si ya no hay paginas siguientes, filtramos los datos
    // Si son documentos, filtramos únicamente los pdfs
    return resources.filter((resource) =>
      resource.links.some(
        (link) =>
          link.link_type === 'uploaded' &&
          (link.name.endsWith('.pdf') || link.name.endsWith('.txt'))
      )
    );
  }
  if (resourceType === resourceTypeDic.dataLayer) {
    // Si son capas geográficas, excluimos aquellos que no tengan geometria
    const newResources = resources.filter((resource) => isGeometricExtension(resource.extent));
    const locals = newResources.filter((resource) => resource.sourcetype === 'LOCAL');
    // Revisamos si los servicios remotos tienen tabla
    let remotes = newResources.filter((resource) => resource.sourcetype === 'REMOTE');
    const filterRemotes = await Promise.all(
      remotes.map(async (resource) => {
        return { resourceValue: resource, resourceHasWms: await hasWMS(resource, 'map') };
      })
    );
    remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
    return locals.concat(remotes);
  }
  if (resourceType === resourceTypeDic.dataTable) {
    // Si son capas geográficas, excluimos aquellos que no tengan geometria
    const newResources = resources.filter((resource) => resource.subtype !== 'raster');
    const locals = newResources.filter((resource) => resource.sourcetype === 'LOCAL');
    // Revisamos si los servicios remotos tienen tabla
    let remotes = newResources.filter((resource) => resource.sourcetype === 'REMOTE');
    const filterRemotes = await Promise.all(
      remotes.map(async (resource) => {
        return { resourceValue: resource, resourceHasWms: await hasWMS(resource, 'table') };
      })
    );
    remotes = filterRemotes.filter((d) => d.resourceHasWms).map((d) => d.resourceValue);
    return locals.concat(remotes);
  }
}
