import { defineStore } from 'pinia';
import { cleanInput } from '~/utils/consulta';

export const useFilteredResources = defineStore('filteredResources', () => {
  const storeFetched = useFetchedResources2Store();
  const { data } = useAuth();
  const isLoggedIn = ref(data.value ? true : false);
  const userEmail = data.value?.user.email;

  //const resourceType = ref('');

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

    //resourceType,

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

    sort(datum) {
      let data = datum;
      // si algo está seleccionado
      if (filters.sort.trim().length >= 1) {
        // Ordenamos por más reciente
        if (filters.sort === 'fecha_descendente') {
          data = data.sort((a, b) => {
            if (a.last_updated < b.last_updated) {
              return 1;
            }
            if (a.last_updated > b.last_updated) {
              return -1;
            }
            return 0;
          });
        }
        // Ordenamos por más antiguo
        if (filters.sort === 'fecha_ascendente') {
          data = data.sort((a, b) => {
            if (a.last_updated > b.last_updated) {
              return 1;
            }
            if (a.last_updated < b.last_updated) {
              return -1;
            }
            return 0;
          });
        }
        // Ordenamos por titulo
        if (filters.sort === 'titulo') {
          data = data.sort((a, b) => {
            const titleA = a.title.toUpperCase();
            const titleB = b.title.toUpperCase();
            if (titleA > titleB) {
              return 1;
            }
            if (titleA < titleB) {
              return -1;
            }
            return 0;
          });
        }
        // Ordenamos por categoria
        if (filters.sort === 'categoria') {
          let conCategoria = data.filter((r) => r.category !== null);
          const sinCategoria = data.filter((r) => r.category === null);
          conCategoria = conCategoria.sort((a, b) => {
            if (a.category.gn_description > b.category.gn_description) {
              return 1;
            }
            if (a.category.gn_description < b.category.gn_description) {
              return -1;
            }
            return 0;
          });
          data = conCategoria.concat(sinCategoria);
        }
      }
      return data;
    },

    filter(type) {
      let data;
      type === 'all' ? (data = storeFetched.all) : (data = storeFetched.byResourceType());
      // Aplicamos el filtro del input
      if (filters.inputSearch !== null) {
        data = data.filter((resource) => cleanInput(resource.title).includes(filters.inputSearch));
      }
      if (isLoggedIn) {
        // Filtramos por propietario
        if (filters.owner === 'catalogo') {
          data = data.filter(
            (resource) => resource.owner.email !== userEmail || resource.is_published === true
          );
        } else if (filters.owner === 'misArchivos') {
          data = data.filter(
            (resource) => resource.owner.email === userEmail && resource.is_published === false
          );
        }
      }

      // Filtramos por categoria
      if (filters.categories.length > 0) {
        let datumCat = [];
        if (filters.categories.includes('Sin Clasificar')) {
          datumCat = data.filter((resource) => !resource.category);
        }
        //data = data.filter((resource) => resource.category);
        data = data.filter((resource) =>
          filters.categories.includes(resource.category?.gn_description)
        );
        data = data.concat(datumCat);
      }
      // Filtramos por año
      if (filters.years !== null && filters.years !== '') {
        const datumYears = [];
        const yearList = filters.years.split(',').map((year) => year.trim());
        data.forEach((resource) => {
          const resourceYear = resource.date.slice(0, 4);
          //console.log(resourceYear, resource.title);
          if (yearList.includes(resourceYear)) {
            datumYears.push(resource);
          }
        });
        data = datumYears;
      }
      // Filtramos por institución
      if (filters.institutions !== null && filters.institutions !== '') {
        const datumInst = [];
        const institutionList = filters.institutions
          .split(',')
          .map((institution) => cleanInput(institution));
        data = data.filter((resource) => resource.attribution);
        data.forEach((resource) => {
          const resourceInst = cleanInput(resource.attribution);
          // Primero revisamos si resource.attribution coincide con alguna de las palabras de las lista
          if (institutionList.includes(resourceInst)) {
            datumInst.push(resource);
          }
          // Luego revisamos si resource.attribution incluye alguna de las palabras de la lista
          institutionList.forEach((word) => {
            if (resourceInst.includes(word)) {
              datumInst.push(resource);
            }
          });
        });
        data = datumInst;
      }
      // Filtramos por keyword
      if (filters.keywords !== null) {
        data = data.filter((resource) => resource.keywords.length > 0);
        const keywordList = filters.keywords.split(',').map((word) => cleanInput(word));
        // Si los filtros por keywords son incluyentes
        const subdataUuid = [];
        keywordList.forEach((keyword) => {
          data.forEach((resource) => {
            let resourceKeywords = resource.keywords.map((d) => cleanInput(d.name));
            resourceKeywords = resourceKeywords.join('-');
            if (resourceKeywords.includes(keyword)) {
              subdataUuid.push(resource.uuid);
            }
          });
        });
        data = data.filter((resource) => subdataUuid.includes(resource.uuid));
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
      }

      // Filtramos por capas
      if (filters.resourceType === 'capas') {
        data = data.filter((d) => d.resource_type !== 'document' && isGeometricExtension(d.extent));
      }
      // Filtramos por tablas
      if (filters.resourceType === 'tablas') {
        data = data.filter(
          (d) => d.resource_type !== 'document' && !isGeometricExtension(d.extent)
        );
      }
      // Filtramos por documentos
      if (filters.resourceType === 'documentos') {
        data = data.filter((d) => d.resource_type === 'document');
      }
      // Filtramos por archivos remotas
      if (filters.resourceType === 'remotas') {
        data = data.filter((resource) => resource.sourcetype === 'REMOTE');
      }

      // si hay opciones asignadas para ordenar
      if (filters.sort !== null) {
        data = this.sort(data);
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
