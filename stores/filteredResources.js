import { defineStore } from 'pinia';
import { cleanInput, resourceTypeGeonode, unaccentUppercase } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeConsulta = useConsultaStore();
  const storeCatalogo = useCatalogoStore();
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
    requests: null,
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
      filters.requests = null;
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
    async buildQueryParams(resourceType = storeConsulta.resourceType) {
      filters.resourceType = resourceType;
      const queryParams = {};
      // Agregamos queryparams correspondientes al tipo de recurso
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

      // Agregamos queryparams para filtrar por status de la solicitud
      if (filters.requests !== null) {
        if (filters.requests === 'all') {
          queryParams['filter{owner}'] = `${storeCatalogo.userInfo.pk}`;
        }
        if (filters.requests === 'pending') {
          queryParams['filter{status}'] = 'pending';
          queryParams['filter{owner}'] = `${storeCatalogo.userInfo.pk}`;
        }
        if (filters.requests === 'on_review') {
          queryParams['filter{status}'] = 'on_review';
          queryParams['filter{owner}'] = `${storeCatalogo.userInfo.pk}`;
        }
        if (filters.requests === 'published') {
          queryParams['filter{status}'] = 'published';
          queryParams['filter{owner}'] = `${storeCatalogo.userInfo.pk}`;
        }
        if (filters.requests === 'rejected') {
          queryParams['filter{status}'] = 'rejected';
          queryParams['filter{owner}'] = `${storeCatalogo.userInfo.pk}`;
        }
      }

      // Agregamos queryparams para buscar por palabras en los campos de title y abstract
      if (filters.inputSearch !== null && filters.inputSearch.length > 0) {
        const wordsToSearch = filters.inputSearch.split(',').map((d) => cleanInput(d));
        queryParams['search_fields'] = ['title', 'abstract'];
        queryParams['search'] = wordsToSearch;
      }

      // Agregamos queryparams para buscar según propietario
      if (filters.owner !== 'todos') {
        if (filters.owner === 'privados') {
          //queryParams['filter{owner.username}'] = userEmail;
          queryParams['filter{is_published}'] = 'false';
          queryParams['filter{is_approved}'] = 'false';
        }
        if (filters.owner === 'catalogo' && filters.resourceType === 'dataLayer') {
          queryParams['filter{is_published}'] = 'true';
          queryParams['filter{subtype.in}'] = ['vector', 'raster'];
        }
        if (filters.owner === 'catalogo' && filters.resourceType !== 'dataLayer') {
          queryParams['filter{is_published}'] = 'true';
        }
        if (filters.owner === 'remotos') {
          queryParams['filter{subtype.in}'] = 'remote';
        }
      }

      // Agregamos queryparams para buscar por categoria
      if (filters.categories.length > 0) {
        queryParams['filter{category.identifier.in}'] = filters.categories;
      }

      // Agregamos queryparams para filtrar por año
      if (filters.years !== null && filters.years.length > 0) {
        const yearList = filters.years.split(',').map((d) => d.trim());
        queryParams['filter{year}'] = yearList;
      }

      // Agregamos query params para buscar por institución
      if (filters.institutions !== null && filters.institutions.length > 0) {
        const institutionList = filters.institutions.split(',').map((d) => cleanInput(d));
        queryParams['filter{institution}'] = institutionList;
      }

      // Agregamos queryparams para filtrar por keywords
      if (filters.keywords !== null && filters.keywords.length > 0) {
        const keywordsList = filters.keywords.split(',').map((d) => unaccentUppercase(d));
        queryParams['filter{keywords.name.in}'] = keywordsList;
      }

      // Agregamos queryparams para ordenar
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
      // Actualizamos los queryparams
      filters.queryParams = queryParams;
      //console.log(filters.queryParams);
    },
  };
});
