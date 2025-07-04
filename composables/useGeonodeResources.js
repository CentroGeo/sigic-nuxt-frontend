// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
// TODO: Preparar para iterar en caso de que se tengan demasiados recursos
import { ref } from "vue";
//console.log("aja: ", useAuth());
// const { data: session } = useAuth();

export function useGeonodeResources({
  pageNumber,
  pageSize,
  resourceType,
} = {}) {
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;
  const resourcesList = ref([]);

  /*     if (!session.value?.accessToken) {
    console.warn("No access token, cannot fetch private resources");
    return;
  } */

  const fetchData = async ({ pageNumber, pageSize, resourceType }) => {
    const dataParams = new URLSearchParams({
      page: pageNumber,
      page_size: pageSize,
      "filter{resource_type}": resourceType,
    });
    fetch(`${api}?${dataParams.toString()}`, {
      method: "GET",
      /*       headers: {
        Authorization: `Bearer ${session.value.accessToken}`,
      }, */
    })
      .then((response) => {
        if (response.ok) return response.json();
        return { resources: [] };
      })
      .then(({ resources }) => {
        //if (resources.length === 0) return;
        resourcesList.value = resources;
        //console.log(resourcesList.value);
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
