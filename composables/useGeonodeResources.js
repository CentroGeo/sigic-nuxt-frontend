// Este composable es una función que recibe los parámetros para hacer una petición a GeoNode
// Y regresa los datos de la solicitud
import { ref } from "vue";

export function useGeonodeResources({
  pageNumber,
  pageSize,
  resourceType,
} = {}) {
  const { VITE_GEONODE_API, VITE_GEONODE_URL } = import.meta.env;
  const api = `${VITE_GEONODE_URL}${VITE_GEONODE_API}/resources`;
  const resourcesList = ref([]);
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

  const fetchData = async ({ newNum, newSize, newType }) => {
    //console.log("fetchData: ", newNum, newSize, newType);
    const newParams = new URLSearchParams({
      page: newNum,
      page_size: newSize,
      "filter{resource_type}": newType,
      // 'filter{group.name}': 'dgpdi',
      // 'filter{category.identifier}': identifier,
    });
    fetch(`${api}?${newParams.toString()}`)
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

  return {
    resourcesList,
    refetch: fetchData,
  };
}
