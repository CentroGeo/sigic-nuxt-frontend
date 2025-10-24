import { defineStore } from 'pinia';
import { cleanInput, resourceTypeGeonode } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeConsulta = useConsultaStore();
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
    /**
     * Actualiza el valor de alguno de los filtros
     * @param {String} filter
     * @param {*} value
     */
    updateFilter(filter, value) {
      filters[filter] = value;
    },
    /**
     * Regresa todos los filtros a su valor inicial
     */
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
    /**
     * Regresa los filtros del modal de búsqueda avanzada a su valor original
     */
    resetFilters() {
      filters.categories = [];
      filters.years = null;
      filters.institutions = null;
      filters.keywords = null;
    },
    /**Construye queryparams a partir de los filtros */
    buildQueryParams(resourceType = storeConsulta.resourceType) {
      filters.resourceType = resourceType;
      const queryParams = {};
      if (filters.resourceType !== 'all' && filters.resourceType !== undefined) {
        if (filters.resourceType === 'remotes') {
          queryParams['filter{subtype.in}'] = 'remote';
        } else {
          queryParams['filter{resource_type}'] = resourceTypeGeonode[filters.resourceType];
          if (filters.resourceType === 'dataLayer') {
            queryParams['filter{has_geometry}'] = 'true';
          }
          if (filters.resourceType === 'dataTable') {
            queryParams['filter{subtype.in}'] = ['vector'];
          }
          if (filters.resourceType === 'document') {
            queryParams['filter{extension}'] = ['pdf', 'txt'];
          }
        }
      }
      if (filters.inputSearch !== null && filters.inputSearch.length > 0) {
        const wordsToSearch = filters.inputSearch.split(',').map((d) => cleanInput(d));
        queryParams['search_fields'] = ['title', 'abstract'];
        queryParams['search'] = wordsToSearch;
      }
      if (filters.owner !== 'todos') {
        if (filters.owner === 'privados') {
          //queryParams['filter{owner.username}'] = userEmail;
          queryParams['filter{is_published}'] = 'false';
          queryParams['filter{is_approved}'] = 'false';
        }
        if (filters.owner === 'catalogo') {
          queryParams['filter{is_published}'] = 'true';
        }
        if (filters.owner === 'remotos') {
          queryParams['filter{subtype.in}'] = 'remote';
        }
      }
      if (filters.categories.length > 0) {
        queryParams['filter{category.identifier.in}'] = filters.categories;
      }
      if (filters.years !== null && filters.years.length > 0) {
        const yearList = filters.years.split(',').map((d) => d.trim());
        queryParams['filter{year}'] = yearList;
      }
      if (filters.institutions !== null && filters.institutions.length > 0) {
        const institutionList = filters.institutions.split(',').map((d) => cleanInput(d));
        queryParams['filter{institution}'] = institutionList;
      }
      if (filters.keywords !== null && filters.keywords.length > 0) {
        const keywordsList = filters.keywords.split(',').map((d) => cleanInput(d));
        queryParams['filter{keywords.name.in}'] = keywordsList;
      }
      if (filters.sort !== null) {
        if (filters.sort === 'fecha_ascendente') {
          queryParams['sort[]'] = 'last_updated';
        }
        if (filters.sort === 'fecha_descendente') {
          queryParams['sort[]'] = '-last_updated';
        }
        if (filters.sort === 'titulo') {
          queryParams['sort[]'] = 'title';
        }
        if (filters.sort === 'categoria') {
          queryParams['sort[]'] = 'category';
        }
      }
      filters.queryParams = queryParams;
    },
  };
});
