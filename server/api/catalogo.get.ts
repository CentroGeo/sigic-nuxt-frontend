const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const api = `${config.public.geonodeApi}/resources`;

  let page = 1;
  let allResults = [];
  const query = getQuery(event);
  console.log("query", query)
  const token = getHeader(event, 'Authorization');
  //console.log("token", token)
  let header = {};
  if (token) {
    header = { Authorization: `Bearer ${token}` };
  } else {
    header = {};
  }

  // Función para hacer la petición recursiva y traer todos los recursos
  const loadPage = async () => {
    const dataParams = new URLSearchParams({
      page: page,
      // page_size: 15,
      ...query,
    });

    const endpoint = `${api}?${dataParams.toString()}`
    console.log("endnpoint: ", endpoint);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: header,
    });
    //console.log("server api", response)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    // console.log('respuesta', response.headers);
    const { links, resources } = await response.json();
    allResults = allResults.concat(resources);
    if (links.next) {
      // Si la hay, volvemos a solicitar datos
      page += 1;
      return loadPage();
    }
  };

  await loadPage();

  return allResults
})
