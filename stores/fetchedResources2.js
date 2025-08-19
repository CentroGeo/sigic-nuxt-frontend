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

  const isLoading = ref(false);

  return {
    isLoading,

    all: computed(() => Object.values(resources).flat()),

    checkFilling(resourceType = storeConsulta.resourceType) {
      if (resources[resourceType].length > 0) return;

      this.fill(resourceType);
    },

    async fill(resourceType = storeConsulta.resourceType) {
      const { data } = useAuth();

      resources[resourceType] = await $fetch('/api/catalogo', {
        // method: 'GET',
        query: { 'filter{resource_type}': resourceTypeGeonode[resourceType] },
        headers: {
          Authorization: `${data.value?.accessToken}`,
        },
      });
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
  //   /**
  //    * Devuelve un recursos que coincida con un uuid.
  //    * @param {String} uuid del catalogo a buscar.
  //    * @param {String} resourceType tipo de resursos a consultar.
  //    * @returns {Object} ojeto de recursos de geonode.
  //    */
  //   findResource: (state) => (uuidToFind, resourceType) => {
  //     return state[resourceType].find(({ uuid }) => uuid === uuidToFind);
  //   },
  //   /**
  //    * Devuelve una lista de recursos que coincidan con una lista de uuids.
  //    * @param {Array<String>} uuids del catalogo a buscar.
  //    * @param {String} resourceType tipo de resursos a consultar.
  //    * @returns {Array<Object>} lista de ojetos de recursos de geonode.
  //    */
  //   findResources: (state) => (uuidsToFind, resourceType) => {
  //     return state[resourceType].filter(({ uuid }) => uuidsToFind.includes(uuid));
  //   },
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
