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
export async function fetchHarvesters(params) {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const dataParams = new URLSearchParams(params);
  const url = `${config.public.geonodeApi}/services/?${dataParams.toString()}`;
  const data = [];
  let status = 'ok';

  try {
    // Obtenemos la información de todos los harvesters

    const requestServices = await gnoxyFetch(url);
    if (!requestServices.ok) {
      const error = await requestServices.json();
      console.error('Falló petición de harvesters:', error);
    }
    const resHarvesters = await requestServices.json();
    const harvesters = [...resHarvesters.results];

    // Creamos el objeto con la información que nos interesa
    await Promise.all(
      harvesters.map(async (h, index) => {
        const harvesterUrl = `${config.public.geonodeApi}/harvesters/${h.harvester_id}`;
        const fetchHarvesterStatus = await gnoxyFetch(harvesterUrl);
        const resHarvesterStatus = await fetchHarvesterStatus.json();
        const harvesterStatus = resHarvesterStatus.harvester.status;

        const fetchHarvestableResources = await gnoxyFetch(
          `${harvesterUrl}/harvestable-resources/?page_size=1`
        );
        const resHarvestableResources = await fetchHarvestableResources.json();
        const totalResources = resHarvestableResources.total;

        const harvesterDatasets = `${config.public.geonodeApi}/sigic-remote-datasets/?harvester_id=${h.harvester_id}`;
        const fetchHarvesterDatasets = await gnoxyFetch(harvesterDatasets);
        const dataB = await fetchHarvesterDatasets.json();
        const importedResources = dataB.total;

        data[index] = {
          id: h.harvester_id,
          title: h.title,
          status: harvesterStatus,
          total_resources: totalResources,
          imported_resources: importedResources,
          to_attend_resources: totalResources - importedResources,
          remote_url: h.url,
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
