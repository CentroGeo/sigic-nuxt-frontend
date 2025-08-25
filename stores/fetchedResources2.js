import { defineStore } from 'pinia';
import { resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';

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

    byResourceType,

    // all: computed(() => Object.values(resources).flat()),
    all: computed(() => [
      ...resources[resourceTypeDic.dataTable],
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
          'filter{resource_type}': resourceTypeGeonode[resourceType],
          // agregar filtros
        },
        headers: {},
      };

      if (data.value?.accessToken) {
        options.headers.token = data.value?.accessToken;
        //console.info(new Date(data.value.expires));
      }

      const { error, allResults } = await $fetch('/api/catalogo', options);

      if (error !== undefined) {
        alert('Vuelve a iniciar sesión');
        return;
      }

      // T E M P O R A L
      resources[resourceType] = validacionTemporal(allResults, resourceType);
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

function validacionTemporal(resources, resourceType) {
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
    return resources.filter((resource) => isGeometricExtension(resource.extent));
  }
  if (resourceType === resourceTypeDic.dataTable) {
    // Si son capas geográficas, excluimos aquellos que no tengan geometria
    return resources.filter((resource) => resource.subtype !== 'raster');
  }

  return resources;
}
