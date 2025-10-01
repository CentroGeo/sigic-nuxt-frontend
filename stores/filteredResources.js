import { defineStore } from 'pinia';
//import { cleanInput } from '~/utils/consulta';
import { buildUrl, cleanInput, resourceTypeGeonode } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeConsulta = useConsultaStore();
  const config = useRuntimeConfig();
  const { gnoxyFetch } = useGnoxyUrl();
  //const { data } = useAuth();
  //const isLoggedIn = ref(data.value ? true : false);
  //const userEmail = data.value?.user.email;
  const filters = reactive({
    inputSearch: null,
    owner: 'todos',
    categories: [],
    years: null,
    institutions: null,
    keywords: null,
    resourceType: null,
    sort: null,
  });

  return {
    filters,

    updateFilter(filter, value) {
      filters[filter] = value;
    },
    resetAll() {
      filters.inputSearch = null;
      filters.owner = 'todos';
      filters.categories = [];
      filters.years = null;
      filters.institutions = null;
      filters.keywords = null;
      filters.resourceType = null;
      filters.sort = null;
    },
    resetFilters() {
      filters.categories = [];
      filters.years = null;
      filters.institutions = null;
      filters.keywords = null;
    },
    async fetchFilteredData(resourceType = storeConsulta.resourceType) {
      filters.resourceType = resourceType;
      const queryParams = {};
      if (filters.resourceType !== 'all') {
        queryParams['filter{resource_type}'] = resourceTypeGeonode[filters.resourceType];
      }
      /* if (filters.inputSearch !== null) {
        queryParams['search'] = filters.inputSearch;
        queryParams['search_fields'] = ['title', 'abstract'];
      } */
      /* if (isLoggedIn && filters.owner !== 'todos') {
        if (filters.owner === userEmail) {
          queryParams['owner'] = userEmail;
        } else {
          // Agregar la logica para excluir un usuario
        }
      } */
      if (filters.categories.length > 0) {
        queryParams['filter{category.identifier.in}'] = filters.categories;
      }
      /*     if (filters.years !== null && filters.years.length > 0) {
      }
      if (filters.institutions !== null && filters.institutions.length > 0) {
      } */
      if (filters.keywords !== null && filters.keywords.length > 0) {
        const newKeywords = filters.keywords.split(',').map((d) => cleanInput(d));
        queryParams['filter{keywords.name.in}'] = newKeywords;
      }
      /*     if (filters.sort !== null) {
      } */

      const url = buildUrl(`${config.public.geonodeUrl}/api/v2/resources`, queryParams);
      const res = await gnoxyFetch(url);
      const data = await res.json();
      return data.resources;
    },
  };
});
