// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
import { ref } from "vue";

export function useGeonodeResources({ resourceType } = {}) {
  //const { data: authData, status: authStatus } = useAuth();
  //console.log(authData.value, authStatus.value);
  //const token = ref(authData.value?.accessToken);
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;
  const resourcesList = ref([]);
  const typeDict = {
    dataLayer: "dataset",
    dataTable: "dataset",
    document: "document",
  };

  const fetchData = async ({ resourceType }) => {
    let page = 1;
    let allResults = [];
    const loadPage = () => {
      const dataParams = new URLSearchParams({
        page: page,
        page_size: 15,
        "filter{resource_type}": typeDict[resourceType],
        //"filter{subtype.in}": "raster",
        //"filter{subtype.in}": "vector",
      });
      // TODO: remover console logs
      // https://geonode.dev.geoint.mx/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset
      // console.log("dataParams", dataParams);
      // console.log(`${api}?${dataParams.toString()}`);
      fetch(`${api}?${dataParams.toString()}`, {
        method: "GET",
        /*         headers: {
          ...(authStatus.value === "authenticated"
            ? { Authorization: `Bearer ${token.value}` }
            : {}),
        }, */
      })
        .then((response) => {
          // console.log("response", response);
          if (response.ok) return response.json();
          return { resources: [] };
        })
        .then((data) => {
          const resources = data.resources || [];
          allResults = allResults.concat(resources);
          // console.log("data", data);
          // console.log("page", page);
          // Revisamos si hay una pagina siguiente
          if (data.links.next && page < 3) {
            // Si la hay, volvemos a solicitar datos
            page += 1;
            return loadPage();
          } else if (resourceType === "document") {
            //Si ya no hay paginas siguientes, filtramos los datos
            // Si son documentos, filtramos únicamente los pdfs
            resourcesList.value = allResults.filter((resource) =>
              resource.links.some(
                (link) =>
                  link.link_type === "uploaded" && link.name.endsWith(".pdf")
              )
            );
          } else if (resourceType === "dataLayer") {
            // Si son capas geográficas, excluimos aquellos que no tengan geometria
            let noGeometryExtent = [-1, -1, 0, 0];
            resourcesList.value = allResults.filter(
              (resource) =>
                !resource.extent.coords.every(
                  (value, index) => value === noGeometryExtent[index]
                )
            );
          } else {
            resourcesList.value = allResults;
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          //console.log("fin");
        });
    };
    loadPage();
  };
  fetchData({ resourceType });

  return {
    resourcesList,
    refetch: fetchData,
  };
}
