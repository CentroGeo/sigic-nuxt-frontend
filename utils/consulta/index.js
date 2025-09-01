export const resourceTypeDic = {
  dataLayer: 'dataLayer',
  dataTable: 'dataTable',
  document: 'document',
};

export const resourceTypeGeonode = {
  [resourceTypeDic.dataLayer]: 'dataset',
  [resourceTypeDic.dataTable]: 'dataset',
  [resourceTypeDic.document]: 'document',
};

export const categoriesInSpanish = {
  Biota: 'Biota',
  Boundaries: 'Fronteras',
  'Climatology Meteorology Atmosphere': 'Climatología, Meteorología y Atmósfera',
  Economy: 'Economía',
  Elevation: 'Elevación',
  Environment: 'Medio Ambiente',
  Farming: 'Agricultura',
  'Geoscientific Information': 'Información Geocientífica',
  Health: 'Salud',
  'Imagery Base Maps Earth Cover': 'Mapas Base y Cobertura Terrestre',
  'Inland Waters': 'Aguas Continentales',
  'Intelligence Military': 'Inteligencia Militar',
  Location: 'Ubicación',
  Oceans: 'Oceanos',
  'Planning Cadastre': 'Planeación Catastral',
  Population: 'Población',
  Society: 'Sociedad',
  Structure: 'Estructura',
  Transportation: 'Transporte',
  'Utilities Communication': 'Servicios Públicos y Comunicación',
  'Sin clasificar': 'Sin Clasificar',
};
export function cleanInput(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function tooltipContent(resource) {
  let formatedAbstract = 'Sin descripción';
  if (resource.abstract) {
    formatedAbstract = resource.abstract
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      .replace(/^<pre>/, '')
      .replace(/<\/pre>$/, '');
  }
  const content =
    `<p style="max-width:250px">${formatedAbstract}</p>` +
    `<p style="max-width:250px">${resource.attribution || 'Sin fuente'}</p>`;
  return content;
}
/**
 * Regresa el servidor en el que esta alojado un recurso
 * @param {Object} resource
 * @returns {String}
 */
export function getWMSserver(resource) {
  //const proxy = 'https://geonode.dev.geoint.mx/proxy/?url=';
  const wmsObject = resource.links.filter((link) => link.link_type === 'OGC:WMS');
  const link = wmsObject[0]['url'].replace('http', 'https');
  return `${link}`;
}
/**
 * Esta funcion revisa si el servidor que aloja un servicio remoto WFS
 * tiene servicios especificos
 * @param {Object} resource Es el recurso del que se desea obtener más informacion
 * @param {String} service Se relaciona con el uso que se le dará a la informacion
 * @returns {Boolean}
 */
export async function hasWMS(resource, service) {
  //const config = useRuntimeConfig();
  //const apiGeonode = config.public.geonodeUrl;
  //const proxy = `${apiGeonode}/proxy/?url=`;
  const wmsObject = resource.links.filter((link) => link.link_type === 'OGC:WMS');
  const wmsLink = wmsObject[0]['url'].replace('http', 'https').replace('httpss', 'https');
  const url = new URL(wmsLink);
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetCapabilities',
  }).toString();
  const res = await fetch(`${url}`);
  if (!res.ok) {
    console.error('Fracasó la petición getCapabilities');
    return false;
  }
  const data = await res.text();
  if (data.includes('ExceptionReport')) {
    console.error('No se puede usar el WMS');
    return false;
  } else {
    if (service === 'map') {
      return true;
    } else if (service === 'table' || service === 'geometry') {
      if (data.includes('GetFeature')) {
        return true;
      } else return false;
    } else {
      console.error('No se reconoce el tipo de petición que se necesita');
      return false;
    }
  }
}
/**
 * Consulta al servidor que aloja un recurso o servicio remoto WFS para
 * obtener el tipo de geomeria del mismo
 * @param {Object} resource
 * @param {String} server
 * @returns
 */
export async function fetchGeometryType(resource, server) {
  const config = useRuntimeConfig();
  const api = config.public.geoserverUrl;
  const url = server === 'sigic' ? new URL(`${api}/ows`) : new URL(server);
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    //typeName: 'sob_alim:glifo_sup_sembrada_herbicida_07_mun_a',
    typeName: resource.alternate,
    maxFeatures: 1,
    outputFormat: 'application/json',
  }).toString();

  const res = await fetch(url);
  if (!res.ok) {
    return 'Error';
  }
  try {
    const data = await res.json();
    if (
      Array.isArray(data.features) &&
      data.features.length > 0 &&
      data.features[0]?.geometry?.type
    ) {
      return data.features[0].geometry.type;
    }

    return 'Error';
  } catch {
    return 'Remoto';
  }
}

export async function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

export function downloadDocs(resource) {
  const extension = resource.links?.find((link) => link.link_type === 'uploaded').extension;
  const anchor = document.createElement('a');
  anchor.href = resource.download_url;
  anchor.download = `${resource.title}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadMetadata(resource) {
  const config = useRuntimeConfig();
  const api = new URL(`${config.public.geonodeUrl}/catalogue/csw`);
  api.search = new URLSearchParams({
    request: 'GetRecordById',
    service: 'CSW',
    version: '2.0.2',
    id: resource.uuid,
    outputschema: 'http://www.isotc211.org/2005/gmd',
    elementsetname: 'full',
  }).toString();

  const res = await fetch(api);
  const dataBlob = await res.blob();
  const blobLink = URL.createObjectURL(dataBlob);
  const anchor = document.createElement('a');
  anchor.href = blobLink;
  anchor.download = `${resource.title}_metadata.xml`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobLink);
}

export async function downloadWMS(resource, format, featureTypes) {
  const config = useRuntimeConfig();
  const formatDict = {
    xls: 'excel',
    xlsx: 'excel2007',
    gpkg: 'application/x-gpkg',
    geojson: 'application/json',
    csv: 'csv',
    kml: 'application/vnd.google-earth.kml+xml',
  };
  let params;
  if (featureTypes !== 'all') {
    params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      outputFormat: formatDict[format],
      propertyName: featureTypes,
    };
  } else {
    params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      outputFormat: formatDict[format],
    };
  }

  let url = new URL(`${config.public.geoserverUrl}/ows`);
  url.search = new URLSearchParams(params).toString();
  // Si es un Json vamos a tener que forzar la descarga
  if (format === 'geojson') {
    const jsonRequest = await fetch(url);
    if (!jsonRequest.ok) {
      console.error('Falló el forzar la descarga del json');
      return;
    }
    const jsonResponse = await jsonRequest.json();
    const blob = new Blob([JSON.stringify(jsonResponse)], {
      type: 'application/json',
    });
    const blobLink = URL.createObjectURL(blob);
    url = blobLink;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadNoGeometry(resource, format) {
  const config = useRuntimeConfig();
  // Revisamos si la capa es remota
  if (resource.sourcetype === 'remote') {
    alert('Esta capa es remota y no se puede descargar');
    return;
  }
  // Si la capa no es remota, revisamos sus columnas para excluir las de geometria
  const describeFeatureUrl = new URL(`${config.public.geoserverUrl}/ows`);
  describeFeatureUrl.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'DescribeFeatureType',
    typeName: resource.alternate,
    outputFormat: 'application/json',
  }).toString();

  const res = await fetch(describeFeatureUrl);
  if (!res.ok) {
    return 'Error';
  }
  const data = await res.json();
  const features = data.featureTypes[0]['properties'];
  const props = features
    .filter((prop) => prop.name.toLowerCase() !== 'geometry')
    .map((prop) => prop.name);
  // Llamamos la función de descarga
  downloadWMS(resource, format, props.join());
}

export function downloadRaster(resource) {
  const urlArray = resource.download_urls.filter((link) => link.url.includes('/assets/'));
  const url = urlArray[0].url;
  //const config = useRuntimeConfig();
  //const url = `${config.public.geonodeUrl}/datasets/${resource.alternate}/dataset_download`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.download = `${resource.title}.tiff`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
