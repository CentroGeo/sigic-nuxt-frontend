// https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset

export function useDemoGeonodeResources({ recursosTipo }) {
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;
  const tipoDict = {
    dataLayer: "dataset",
    dataTable: "dataset",
    document: "document",
  };

  const listaRecursos = ref([]);
  const enlaces = ref([]);
  const pagina = ref(0);
  const paginaTamanio = ref(0);
  const total = ref(0);

  const data = fetch(
    `https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=${tipoDict[recursosTipo]}`,
    // `https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      // return res.json();
      if (response.ok) return response.json();
    })
    .then((json) => {
      // TODO: aquí se pueden obtener las distintas propiedades
      // links, page, page_size, resorces, total
      const dataJSON = json;
      enlaces.value = json.links;
      pagina.value = json.page;
      paginaTamanio.value = json.page_size;
      // listaRecursos.value = json.resources;

      if (recursosTipo === "document") {
        const documentosFiltrados = json.resources.filter((resource) =>
          resource.links.some(
            (link) =>
              link.link_type === "uploaded" && link.name.endsWith(".pdf")
          )
        );
        documentosFiltrados.forEach((resource) => {
          listaRecursos.value.push({
            // pk: resource.pk,
            // uuid: resource.uuid,
            // title: resource.title,
            resource_type: resource.resource_type,
            // keywords: resource.keywords,
            // category: resource.category,
            // abstract: resource.abstract,
            // attribution: resource.attribution,
            // thumbnail_url: resource.thumbnail_url,
            // extent: resource.extent,
            // date: resource.date,
            // date_type: resource.date_type,
            // created: resource.created,
            last_updated: resource.last_updated,
          });
        });
      } else if (recursosTipo === "dataLayer") {
        // Si son capas geográficas, excluimos aquellos que no tengan geometria
        const noGeometryExtent = [-1, -1, 0, 0];
        const capasFiltradas = json.resources.filter(
          (resource) =>
            !resource.extent.coords.every(
              (value, index) => value === noGeometryExtent[index]
            )
        );
        // console.log("capasFiltradas", capasFiltradas.length);
        capasFiltradas.forEach((resource) => {
          listaRecursos.value.push({
            // pk: resource.pk,
            // uuid: resource.uuid,
            // title: resource.title,
            resource_type: resource.resource_type,
            // keywords: resource.keywords,
            // category: resource.category,
            // abstract: resource.abstract,
            // attribution: resource.attribution,
            // thumbnail_url: resource.thumbnail_url,
            // extent: resource.extent,
            // date: resource.date,
            // date_type: resource.date_type,
            // created: resource.created,
            last_updated: resource.last_updated,
          });
        });
        // console.log("listaRecursos.value", listaRecursos.value.length);
      } else {
        json.resources.forEach((resource) => {
          listaRecursos.value.push({
            // pk: resource.pk,
            // uuid: resource.uuid,
            // title: resource.title,
            resource_type: resource.resource_type,
            // keywords: resource.keywords,
            // category: resource.category,
            // abstract: resource.abstract,
            // attribution: resource.attribution,
            // thumbnail_url: resource.thumbnail_url,
            // extent: resource.extent,
            // date: resource.date,
            // date_type: resource.date_type,
            // created: resource.created,
            last_updated: resource.last_updated,
          });
        });
      }
      total.value = json.total;

      return dataJSON;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      //console.log("fin");
    });

  return {
    listaRecursos,
    data,
  };

  // console.log("adiós");
  // fetch(
  //   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  //   {
  //     method: "GET",
  //   }
  // ).then((response) => {
  //   listaRecursos.value = response;
  // });
  // const listaRecursos = ref(
  //   fetch(
  //     "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  //     {
  //       method: "GET",
  //     }
  //   ).then((response) => {
  //     // return response;
  //     if (response.ok) return response.json();
  //   })
  // );
  // const listaRecursos = async () => {
  //   ref(
  //     fetch(
  //       "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  //       {
  //         method: "GET",
  //       }
  //     )
  //       .then((response) => {
  //         // return response;
  //         if (response.ok) return response.json();
  //         return { resources: [] };
  //       })
  //       .then((data) => {
  //         return data;
  //       })
  //   );
  // };
}
