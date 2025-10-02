import { defineStore } from 'pinia';
//import { cleanInput } from '~/utils/consulta';
import { cleanInput, resourceTypeGeonode } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeConsulta = useConsultaStore();
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
    queryParams: {},
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
      filters.queryParams = {};
    },
    resetFilters() {
      filters.categories = [];
      filters.years = null;
      filters.institutions = null;
      filters.keywords = null;
    },

    buildQueryParams(resourceType = storeConsulta.resourceType) {
      filters.resourceType = resourceType;
      const queryParams = { custom: 'true' };
      // Agregamos lo necesario por tipo de recurso
      if (filters.resourceType !== 'all') {
        queryParams['filter{resource_type}'] = resourceTypeGeonode[filters.resourceType];
        if (filters.resourceType === 'dataLayer') {
          queryParams['extent_ne'] = '[-1,-1,0,0]';
        }
        if (filters.resourceType === 'dataTable') {
          //queryParams['filter{subtype.in}'] = ['vector', 'remote'];
          queryParams['filter{subtype.in}'] = 'vector';
        }
        /*if (filters.resourceType === 'document') {
    queryParams['file_extension'] = ['pdf', 'txt'];
  } */
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
      filters.queryParams = queryParams;
    },
  };
});
