const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const api = `${config.public.geonodeApi}/resources`;

  // let page = 1;
  let allResults = [];
  const query = getQuery(event);
  const token = getHeader(event, 'token');

  const dataParams = new URLSearchParams(query);
  let endpoint = `${api}?${dataParams.toString()}`;
  let error;

  do {
    console.log(endpoint);

    const options = {
      method: 'GET',
      headers: {
        // Authorization:
        //   'Bearer <>',
      },
    };

    if (token !== undefined) {
      console.log(token);
      options.headers = { Authorization: `Bearer ${token}` };
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      // console.log(response);

      error = await response.json();
      console.log(error);

      return { error };
      // throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const { links, resources } = await response.json();
    allResults = allResults.concat(resources);

    endpoint = links.next;
  } while (endpoint !== null);

  return { allResults };
});
