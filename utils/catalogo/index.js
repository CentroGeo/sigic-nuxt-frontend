export async function fetchByPk(pk) {
  const config = useRuntimeConfig();
  const { gnoxyUrl } = useGnoxyUrl();
  const api = gnoxyUrl(`${config.public.geonodeApi}/resources/${pk}`);
  const res = await fetch(api);
  const response = await res.json();
  return response.resource;
}

export function convertirBytes(bytes) {
  const decimals = 2;
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'Kib', 'MiB', 'GiB', 'TiB', 'EiB', 'ZiB', ' YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Esta función recupera información de los harvesters registrados en el sigic
 * @param {Boolean} limited
 * @param {Object} params
 * @returns {Object} Objeto que permite construit las tarjetas y tablas de servicios remotos
 */
export async function fetchHarvesters(limited, params) {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const dataParams = new URLSearchParams(params);
  let url = `${config.public.geonodeApi}/harvesters/?${dataParams.toString()}`;
  const data = [];
  let harvesters = [];
  let status = 'ok';

  try {
    // Obtenemos la información de todos los harvesters
    do {
      const requestHarvesters = await gnoxyFetch(url);
      if (!requestHarvesters.ok) {
        const error = await requestHarvesters.json();
        console.error('Falló petición de harvesters:', error);
      }
      const resHarvesters = await requestHarvesters.json();
      harvesters = [...harvesters, ...resHarvesters.harvesters];
      if (limited) {
        url = undefined;
      } else {
        url = resHarvesters.links.next;
      }
    } while (url);

    // Creamos el objeto con la información que nos interesa
    await Promise.all(
      harvesters.map(async (h, index) => {
        const harvestableResourcesUrl = h.links.harvestable_resources;
        const resA = await gnoxyFetch(`${harvestableResourcesUrl}/?page_size=1`);
        const dataA = await resA.json();
        const totalResources = dataA.total;

        const res2 = await gnoxyFetch(
          `${harvestableResourcesUrl}/?filter{should_be_harvested}=true&page_size=1`
        );
        const dataB = await res2.json();
        const importedResources = dataB.total;

        data[index] = {
          id: h.id,
          title: h.name,
          status: h.status,
          total_resources: totalResources,
          imported_resources: importedResources,
          to_attend_resources: totalResources - importedResources,
          remote_url: h.remote_url,
        };
      })
    );
    status = 'ok';
  } catch (err) {
    console.warn('Error en el streaming: ' + err);
    status = 'error';
  }
  return { status, data };
}
