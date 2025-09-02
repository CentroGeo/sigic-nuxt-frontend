import { defineStore } from 'pinia';
import { cleanInput } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeFetched = useFetchedResources2Store();
  const { data } = useAuth();
  const isLoggedIn = ref(data.value ? true : false);
  const userEmail = data.value?.user.email;

  const filters = reactive({
    inputSearch: null,
    owner: 'todos',
    categories: [],
    years: null,
    institutions: null,
    keywords: null,
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
    },
    resetFilters() {
      filters.categories = [];
      filters.years = null;
      filters.institutions = null;
      filters.keywords = null;
    },

    filter() {
      let data = storeFetched.byResourceType();
      // Aplicamos el filtro del input
      if (filters.inputSearch !== null) {
        data = data.filter((resource) => cleanInput(resource.title).includes(filters.inputSearch));
      }
      if (isLoggedIn) {
        // Filtramos por propietario
        if (filters.owner === 'catalogo') {
          data = data.filter((resource) => resource.owner.email !== userEmail);
        } else if (filters.owner === 'misArchivos') {
          data = data.filter((resource) => resource.owner.email === userEmail);
        }
      }

      // Filtramos por año
      if (filters.years !== null) {
        const yearList = filters.years.split(',');
        yearList.forEach(
          (year) =>
            (data = data.filter((resource) => {
              const resourceYear = resource.created.slice(0, 4);
              resourceYear === year.trim();
            }))
        );
      }
      // Filtramos por institución
      if (filters.institutions !== null) {
        data = data.filter((resource) => resource.attribution);
        const institutionList = filters.institutions.split(',');
        institutionList.forEach((institution) => {
          data = data.filter(
            (resource) => cleanInput(resource.attribution) === cleanInput(institution)
          );
        });
      }
      // Filtramos por keyword
      if (filters.keywords !== null) {
        data = data.filter((resource) => resource.keywords.length > 0);
        const keywordList = filters.keywords.split(',');
        // Si los filtros por keywords son excluyentes
        /*         keywordList.forEach((keyword) => {
          data = data.filter((resource) => {
            let resourceKeywords = resource.keywords.map((d) => cleanInput(d.name));
            resourceKeywords = resourceKeywords.join('-');
            if (resourceKeywords.includes(cleanInput(keyword))) {
              return true;
            }
          });
        }); */
        // Si los filtros por keywords son incluyentes
        const subdataUuid = [];
        keywordList.forEach((keyword) => {
          data.forEach((resource) => {
            let resourceKeywords = resource.keywords.map((d) => cleanInput(d.name));
            resourceKeywords = resourceKeywords.join('-');
            if (resourceKeywords.includes(cleanInput(keyword))) {
              subdataUuid.push(resource.uuid);
            }
          });
        });
        data = data.filter((resource) => subdataUuid.includes(resource.uuid));
      }
      // Filtramos por categoria
      if (filters.categories.length > 0) {
        data = data.filter((resource) => resource.category);
        data = data.filter((resource) =>
          filters.categories.includes(resource.category.gn_description)
        );
      }
      return data;
    },
  };
});
// Si se prefiere hacer parte del filtrado haciendo petición
/* async function filterByModal() {
  const { data } = useAuth();
  const queryParams = { 'filter{resource_type}': resourceTypeGeonode[storeConsulta.resourceType] };

  if (institutionInput.value) {
    queryParams['institution'] = institutionInput.value;
  }
  if (yearInput.value) {
    queryParams['year'] = yearInput.value;
  }
  if (keywordsInput.value) {
    queryParams['keywords_csv'] = keywordsInput.value;
  }
  if (inputCategories.value.length > 0) {
    const catParam = [];
    inputCategories.value.forEach((d) => {
      catParam.push(categoriesDict[d]);
    });
    queryParams['filter{category.identifier.in}'] = catParam;
  }

  results.value = await $fetch('/api/catalogo', {
    method: 'GET',
    query: queryParams,
    headers: {
      Authorization: `${data.value?.accessToken}`,
    },
  });
  modalBusqueda.value.cerrarModal();
  return results.value;
} */
