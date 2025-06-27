// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
import { ref } from "vue";

const config = useRuntimeConfig()
const api = `${config.public.geonodeApi}/resources`;

export function useGeonodeResources({
  pageNumber,
  pageSize,
  resourceType,
} = {}) {
  const resourcesList = ref([]);

  const fetchData = async ({ pageNumber, pageSize, resourceType }) => {
    const dataParams = new URLSearchParams({
      page: pageNumber,
      page_size: pageSize,
      "filter{resource_type}": resourceType,
      // 'filter{group.name}': 'dgpdi',
      // 'filter{category.identifier}': identifier,
    });
    fetch(`${api}?${dataParams.toString()}`)
      .then((response) => {
        if (response.ok) return response.json();
        return { resources: [] };
      })
      .then(({ resources }) => {
        if (resources.length === 0) return;
        resourcesList.value = resources;
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        //console.log("fin");
      });
  };
  fetchData({ pageNumber, pageSize, resourceType });
  return {
    resourcesList,
    refetch: fetchData,
  };
}
