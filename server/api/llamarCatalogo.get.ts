import { resourceTypeGeonode } from '~/utils/consulta';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const api = `${config.public.geonodeApi}/resources`;


  // Retoma los queryparams que se pasan
  const { resourceType = 'todos' } = getQuery(event)
  let page = 1;
  let allResults = [];

  const loadPage = async () => {
    // cuando se requiere todos los recursos sin filtrar?
    const dataParams =
      resourceType === 'todos'
        ? new URLSearchParams({
          page: page,
          page_size: 15,
        })
        : new URLSearchParams({
          page: page,
          page_size: 15,
          'filter{resource_type}': resourceTypeGeonode[resourceType],
        });

    const response = await fetch(`${api}?${dataParams.toString()}`, {
      method: 'GET',
      /*headers: {
        ...(authStatus.value === "authenticated"
          ? { Authorization: `Bearer ${token.value}` }
          : {}),
      },*/
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} – ${response.statusText}`);
    }

    const data = await response.json();
    const resources = data.resources || [];
    allResults = allResults.concat(resources);
    if (data.links.next && page < 3) {
      // Si la hay, volvemos a solicitar datos
      page += 1;
      return loadPage();
    }
  }

  await loadPage()
  return allResults
})