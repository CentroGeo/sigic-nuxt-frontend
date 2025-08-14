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

  return {
    isLoading: ref(false),

    all: computed(() => Object.values(resources).flat()),

    checkFilling(resourceType = storeConsulta.resourceType) {
      console.log('checkFilling:', resourceType);
      if (resources[resourceType].length > 0) return;

      this.fill(resourceType);
    },

    async fill(resourceType = storeConsulta.resourceType) {
      console.log('fill:', resourceType);
      const { data } = useAuth();

      const r = await $fetch('/api/catalogo', {
        // method: 'GET',
        query: {
          'filter{resource_type}': resourceTypeGeonode[resourceType],
          // agregar filtro
        },
        headers: {
          Authorization: `${data.value?.accessToken}`,
        },
      });

      // T E M P O R A L
      resources[resourceType] = validacionTemporal(r, resourceType);
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

  // state: () => ({
  //   dataLayer: [],
  //   dataTable: [],
  //   document: [],
  //   all: [],
  //   isLoading: false,
  // }),
  // getters: {

  // },
  // actions: {
  //   /**
  //    *
  //    * @param {String} resourceType
  //    * @param {Array<Object>} newArray
  //    */
  //   updateFetchedResources(resourceType, newArray) {
  //     this[resourceType] = newArray;
  //   },
  // },
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
    const noGeometryExtent = [-1, -1, 0, 0].join('');
    return resources.filter(
      (resource) =>
        // !resource.extent.coords.every((value, index) => value === noGeometryExtent[index])
        resource.extent.coords.join('') !== noGeometryExtent
    );
  }

  return resources;
}
