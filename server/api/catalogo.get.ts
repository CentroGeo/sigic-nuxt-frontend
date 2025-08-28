const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const api = `${config.public.geonodeApi}/resources`;

  let allResults: object[] = [];
  const query: URLSearchParams = getQuery(event);
  const token = getHeader(event, 'token');
  const options: RequestInit = { method: 'GET' };
  if (token !== 'sin-token') {
    options.headers = { Authorization: `Bearer ${token}` };
  }

  const dataParams = new URLSearchParams(query);
  let endpoint = `${api}?${dataParams.toString()}`;

  do {
    const response = await fetch(endpoint.replace('http:', 'https:'), options);

    if (!response.ok) {
      const error = await response.json();
      // throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      return { error, allResults };
    }

    const { links, resources, total } = await response.json();
    allResults = allResults.concat(resources);
    endpoint = links.next;
    console.info('->', allResults.length, 'recuperados de', total);
  } while (endpoint !== null);

  return { allResults };
});
