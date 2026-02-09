export const catalogosSugeridos = [
  {
    id: 1,
    total_resources: 598,
    title: 'GEMA',
    descripcion: 'Infraestructura de Conocimiento Geoespacial',
    abstract: `Infraestructura de Conocimiento Geoespacial, creada en un entorno abierto y con criterios 
    de accesibilidad, integra un modelo de datos libres, así como herramientas para que las personas 
    usuarias puedan consultar, recopilar, visualizar y compartir información geoespacial relacionada con la 
    actividad humanística, científica y tecnológica.`,
    etiquetas: 'Etiqueta',
    tipo: 'WMS',
    origen: 'GEMA',
    origen_url: 'https://gema.conahcyt.mx/',
    service_url: 'https://gema.conahcyt.mx/geoserver/wms',
  },
  {
    id: 2,
    total_resources: 358,
    title: 'Mide MTY',
    descripcion: 'Monterrey Infraestructura de Datos Espaciales',
    abstract: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tempor vehicula blandit. 
    Aliquam at ante urna. Vestibulum finibus magna nunc, nec consequat justo convallis a. Sed a lorem 
    nec dui congue vulputate eu ac sem. Vivamus sed urna nisl. Curabitur et tortor nisl. Vestibulum 
    ac pulvinar arcu, eu tempor erat. Phasellus maximus, neque nec ultricies suscipit, lectus arcu 
    aliquam libero, eget tincidunt est purus sed orci. Donec facilisis, est posuere luctus malesuada, 
    lacus odio auctor purus, sed malesuada mi lacus sed nulla.`,
    etiquetas: 'Etiqueta',
    tipo: 'OWS',
    origen: 'mide+',
    origen_url: 'https://mide.monterrey.gob.mx/',
    service_url: 'https://mide.monterrey.gob.mx/geoserver/ows',
  },
  {
    id: 3,
    total_resources: 137,
    title: 'SEIEG Chiapas',
    descripcion: 'Comité Estatal de Información Estadística y Geográfica',
    abstract: `Es el conjunto de unidades productoras e integradoras de información estadística y 
    geográfica de la administración pública estatal y federal, del sector académico y de la sociedad 
    civil, organizadas para generar y difundir información Sociodemográfica, económica y del medio 
    ambiente de la entidad, con la finalidad de sustentar la planeación y toma de decisiones de los 
    sectores público, social y privado, en congruencia con el Sistema Nacional de Información Estadística 
    y Geográfica (SNIEG). `,
    tipo: 'WMS',
    etiquetas: 'Etiqueta',
    origen: 'CEIEG',
    origen_url: 'https://www.ceieg.chiapas.gob.mx/',
    service_url: 'https://mapas.siese.chiapas.gob.mx/geoserver/POSTGISSER/wms',
  },
  {
    id: 4,
    total_resources: 5375,
    title: 'IDE SEDATU',
    descripcion: 'Infraestructura de Datos Espaciales',
    abstract: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tempor vehicula blandit. 
    Aliquam at ante urna. Vestibulum finibus magna nunc, nec consequat justo convallis a. Sed a lorem 
    nec dui congue vulputate eu ac sem. Vivamus sed urna nisl. Curabitur et tortor nisl. Vestibulum 
    ac pulvinar arcu, eu tempor erat. Phasellus maximus, neque nec ultricies suscipit, lectus arcu 
    aliquam libero, eget tincidunt est purus sed orci. Donec facilisis, est posuere luctus malesuada, 
    lacus odio auctor purus, sed malesuada mi lacus sed nulla.`,
    tipo: 'GN_WMS',
    etiquetas: 'Etiqueta',
    origen: 'Secretaría de Desarrollo Agrario, Territorial y Urbano',
    origen_url: 'https://www.gob.mx/sedatu',
    service_url: 'https://ide.sedatu.gob.mx/',
  },
];

/**
 * Valida si el tipo de recurso es documento o dataset con geometría o no
 * @param recurso del catálogo
 * @returns {String} ya sea Documentos, Capa geográfica o Datos tabulados
 */
export function tipoRecurso(recurso) {
  let tipo;
  if (recurso.resource_type === 'document') {
    tipo = 'Documentos';
  } else if (recurso.sourcetype === 'REMOTE') {
    tipo = 'Capa Geográfica, Catálogo Externo';
  } else {
    tipo = isGeometricExtension(recurso.extent) ? 'Capa Geográfica' : 'Datos Tabulados';
  }
  return tipo;
}

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
  if (!params.title || params.title.trim().length === 0) {
    delete params.title;
  }
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
    const resServices = await requestServices.json();
    const services = [...resServices.results];

    // Creamos el objeto con la información que nos interesa
    await Promise.all(
      services.map(async (h, index) => {
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
