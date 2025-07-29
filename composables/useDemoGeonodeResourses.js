// https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset
console.log("hola");
// const listaRecursos = ref([]);
const listaRecursosV2 = ref([]);
export function useDemoGeonodeResources() {
  // console.log("adiós");
  // fetch(
  //   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  //   {
  //     method: "GET",
  //   }
  // ).then((response) => {
  //   console.log("response", response);
  //   listaRecursos.value = response;
  // });

  // const listaRecursos = ref(
  //   fetch(
  //     "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  //     {
  //       method: "GET",
  //     }
  //   ).then((response) => {
  //     console.log("response", response);
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
  //         console.log("response", response);
  //         // return response;
  //         if (response.ok) return response.json();
  //         return { resources: [] };
  //       })
  //       .then((data) => {
  //         console.log("data", data);
  //         return data;
  //       })
  //   );
  // };

  const data = fetch(
    "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
    {
      method: "GET",
    }
  )
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      // TODO: aquí se pueden obtener las distintas propiedades
      // links, page, page_size, resorces, total
      const dataJSON = json;
      // enlaces.value = json.links;
      // pagina.page = value.page;
      // paginaTamanio.value = json.page_size;
      // TODO: iterar sobre las propiedades necesarias
      // listaRecursosV2.value = json.resources;
      json.resources.forEach((resource) => {
        listaRecursosV2.value.push({
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
        // total.value = json.total;
      });
      return dataJSON;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      //console.log("fin");
    });

  return {
    listaRecursosV2,
    data,
  };
}
