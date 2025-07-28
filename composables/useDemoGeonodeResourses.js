// https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset
console.log("hola");
// const listaRecursos = ref([]);
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

  const listaRecursos = ref(
    fetch(
      "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
      {
        method: "GET",
      }
    ).then((response) => {
      console.log("response", response);
      // return response;
      if (response.ok) return response.json();
    })
  );

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

  return {
    listaRecursos,
  };
}
