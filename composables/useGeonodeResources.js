// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
import { ref } from "vue";
//console.log("aja: ", useAuth());
// const { data: session } = useAuth();

export function useGeonodeResources({ resourceType } = {}) {
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;
  const resourcesList = ref([]);
  const typeDict = {
    dataLayer: "dataset",
    dataTable: "dataset",
    document: "document",
  };

  // Para la autentizacion
  /*     if (!session.value?.accessToken) {
    console.warn("No access token, cannot fetch private resources");
    return;
  } */

  const fetchData = async ({ resourceType }) => {
    let page = 1;
    let allResults = [];
    const loadPage = () => {
      const dataParams = new URLSearchParams({
        page: page,
        page_size: 15,
        "filter{resource_type}": typeDict[resourceType],
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
        .then((data) => {
          const resources = data.resources || [];
          allResults = allResults.concat(resources);
          // Revisamos si hay una pagina siguiente
          console.log("aqui:", allResults.length);
          if (data.links.next) {
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
