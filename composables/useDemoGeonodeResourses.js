// https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset
console.log("hola");
const listaRecursos = ref([]);
export function useDemoGeonodeResources() {
  console.log("adiós");
  fetch(
    "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
    {
      method: "GET",
    }
  ).then((response) => {
    console.log("response", response);
  });

  return {
    listaRecursos,
  };
}
