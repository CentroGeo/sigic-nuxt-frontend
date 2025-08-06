// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
import { ref } from 'vue';

export async function useGeonodeResources({ resourceType } = {}) {
  //const { data: authData, status: authStatus } = useAuth();
  //const token = ref(authData.value?.accessToken);
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;
  const resourcesList = ref([]);
  const typeDict = {
    dataLayer: 'dataset',
    dataTable: 'dataset',
    document: 'document',
  };

  const fetchData = async ({ resourceType }) => {
    let page = 1;
    let allResults = [];
   
    const loadPage = async () => {
      const dataParams = new URLSearchParams({
        page: page,
        page_size: 15,
        'filter{resource_type}': typeDict[resourceType],
        //'filter{is_approved}':true,
      });
      const response = await fetch(`${api}?${dataParams.toString()}`, {
        method: 'GET',
        /*headers: {
          ...(authStatus.value === "authenticated"
            ? { Authorization: `Bearer ${token.value}` }
            : {}),
        },*/
      })
      if(!response.ok){
        throw new Error(`HTTP ${response.status} – ${response.statusText}`);
      }
      const data = await response.json();
      const resources = data.resources || [];
      allResults = allResults.concat(resources);
      if (data.links.next && page < 3) {
        // Si la hay, volvemos a solicitar datos
        page += 1;
        return loadPage();
      }
    }
    await loadPage();
    if (resourceType === 'document') {
      //Si ya no hay paginas siguientes, filtramos los datos
      // Si son documentos, filtramos únicamente los pdfs
        resourcesList.value = allResults.filter((resource) =>
          resource.links.some(
            (link) => link.link_type === 'uploaded' && link.name.endsWith('.pdf')
          )
        );
    } else if (resourceType === 'dataLayer') {
      // Si son capas geográficas, excluimos aquellos que no tengan geometria
      const noGeometryExtent = [-1, -1, 0, 0];
      resourcesList.value = allResults.filter(
        (resource) =>
          !resource.extent.coords.every((value, index) => value === noGeometryExtent[index])
        );
    } else {
      resourcesList.value = allResults;
    }
    return resourcesList.value
    };
  await fetchData({ resourceType });
  return {
    resourcesList,
    refetch: fetchData,
  };
  };

