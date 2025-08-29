const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const api = `${config.public.geonodeApi}/resources`;

  let allResults: object[] = [];
  //const query: URLSearchParams = getQuery(event);
  const query = getQuery(event);
  const token = getHeader(event, 'token');
  const options: RequestInit = { method: 'GET' };
  if (token !== undefined) {
    options.headers = { Authorization: `Bearer ${token}` };
  }

  //const dataParams = new URLSearchParams(query);
  const dataParams = new URLSearchParams();
  const filtersDict = Object.keys(query);
  filtersDict.forEach((filter) => {
    const value = query[filter];
    if (typeof value === 'string') {
      dataParams.append(filter, value);
    } else if (Array.isArray(value)) {
      value.forEach((option) => dataParams.append(filter, option));
    }
  });

  //   let endpoint = `${api}?${dataParams.toString()}`;
  let endpoint = `${api}?${dataParams.toString().replace('extent_ne=%5B-1%2C-1%2C0%2C0%5D', 'extent_ne=[-1,-1,0,0]')}`;
  //console.log(endpoint)

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
