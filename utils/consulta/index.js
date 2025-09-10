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
  Oceans: 'Océanos',
  'Planning Cadastre': 'Planeación Catastral',
  Population: 'Población',
  Society: 'Sociedad',
  Structure: 'Estructura',
  Transportation: 'Transporte',
  'Utilities Communication': 'Servicios Públicos y Comunicación',
  'Sin Clasificar': 'Sin Clasificar',
};

/**
 * Formatea el input
 * @param {String} input
 * @returns {String} El input formateado
 */
export function cleanInput(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Formatea texto
 * @param {Object} resource El recurso del cual se obtendrá el texto a formatear
 * @returns {String} HTML formateado
 */
export function tooltipContent(resource) {
  let formatedAbstract = 'Sin descripción';
  if (resource.raw_abstract) {
    formatedAbstract = resource.raw_abstract
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
  const wmsObject = resource.links.find((link) => link.link_type === 'OGC:WMS');
  const link = wmsObject['url'];
  return `${link.split('?')[0]}`;
}

/**
 * Esta funcion revisa si el servidor que aloja un servicio remoto WFS
 * tiene servicios especificos
 * @param {Object} resource Es el recurso del que se desea obtener más informacion
 * @param {String} service Se relaciona con el uso que se le dará a la informacion.
 * Puede ser map, table o geometry
 * @returns {Boolean}
 */
export async function hasWMS(resource, service) {
  const maxAttempts = 3;
  //const config = useRuntimeConfig();
  //const proxy = `${config.public.geonodeUrl}/proxy/?url=`;
  const proxy = 'https://geonode.dev.geoint.mx/proxy/?url=';

  //const wmsObject = resource.links.filter((link) => link.link_type === 'OGC:WMS');
  //const wmsLink = wmsObject[0]['url'];
  //const url = new URL(wmsLink);
  const url = new URL(getWMSserver(resource));
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetCapabilities',
  }).toString();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(proxy + `${encodeURIComponent(url)}`);
      if (!res.ok) {
        console.error('Fracasó la petición getCapabilities');
        continue;
      }

      const data = await res.text();
      if (data.includes('ExceptionReport')) {
        console.error('No se puede usar el WMS', url, resource.alternate, resource.title);
        return false;
      }

      if (service === 'map') {
        return true;
      } else if (service === 'table' || service === 'geometry') {
        if (data.includes('GetFeature')) {
          return true;
        } else return false;
      } else {
        console.error('No se reconoce el tipo de petición que se necesita', url);
        return false;
      }
    } catch {
      console.error(`fracaso la peticion para ${resource.alternate}`);
    }
    return false;
  }
}

/**
 * Consulta al servidor que aloja un recurso o servicio remoto WFS para
 * obtener el tipo de geomeria del mismo
 * @param {Object} resource
 * @param {String} server
 * @returns {String}
 */
export async function fetchGeometryType(resource, server) {
  const maxAttempts = 4;
  const config = useRuntimeConfig();
  const proxy = `${config.public.geonodeUrl}/proxy/?url=`;
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const api = config.public.geonodeUrl;
  const url = server === 'sigic' ? new URL(`${api}/gs/ows`) : new URL(server);
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: resource.alternate,
    maxFeatures: 1,
    outputFormat: 'application/json',
  }).toString();
  //console.log(resource.alternate, url);
  let res;
  if (server !== 'sigic') {
    res = await fetch(proxy + `${encodeURIComponent(url)}`);
  } else if (!token) {
    res = await fetch(url);
  } else if (token) {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  if (!res.ok) {
    return 'Error';
  }

  // Ahora hacemos una petición get al vínculo statusLocation.
  // Como a veces hace timeout, lo intentamos tres veces
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await res.json();
      //console.log(resource.alternate, data);
      if (
        Array.isArray(data.features) &&
        data.features.length > 0 &&
        data.features[0]?.geometry?.type
      ) {
        return data.features[0].geometry.type;
      }
    } catch {
      console.warn('Se está intentando una vez más');
    }
    // Si fracasa en todos los intentos
    return 'Error';
  }
}

/**
 * Espera el tiempo indicado para ejecutar la siguiente linea
 * @param {Number} miliseconds
 * @returns
 */
export async function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
/**
 * Crea una url autenticada que permite visualizar documentos
 * @param {String} url
 * @returns
 */
export async function fetchDoc(url) {
  //const extensionDict = { pdf: 'application/pdf', txt: 'text/plain' };
  const { data } = useAuth();
  const token = data.value?.accessToken;
  let res;
  if (token) {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(url);
  }
  if (!res.ok) {
    throw new Error(`Fetchfailed: ${res.status}`);
  }
  const blob = await res.blob();
  const newUrl = URL.createObjectURL(blob);
  return newUrl;
}

/**
 * Identifica el link indicado, hace una petición autenticada y genera un nuevo link
 * para descargar un archivo pdf o txt
 * @param {Object} resource
 */
export async function downloadDocs(resource) {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const extension = resource.links?.find((link) => link.link_type === 'uploaded').extension;

  let res;
  if (token) {
    res = await fetch(resource.download_url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(resource.download_url);
  }
  if (!res.ok) {
    throw new Error(`Fetchfailed: ${res.status}`);
  }
  const blob = await res.blob();
  const newUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = newUrl;
  anchor.download = `${resource.title.replace('.pdf', '').replace('.txt', '')}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadMetadata(resource) {
  const { data } = useAuth();
  const token = data.value?.accessToken;
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

  //const res = await fetch(api);
  let res;
  if (token) {
    res = await fetch(api, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(api);
  }
  if (!res.ok) {
    throw new Error(`Fetchfailed: ${res.status}`);
  }
  //console.log(res);
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

/**
 * Descarga archivos por medio de peticiones (autenticadas o no) de servicios WMS.
 * La descarga puede ser en los formatos: xls, xlsx, gpkg, geojson, csv y kml).
 * Tambien permite especificar si se quiere que el archivo descargado incluya o no
 * la geometria
 * @param {Object} resource
 * @param {String} format
 * @param {Stringy} featureTypes
 */
export async function downloadWMS(resource, format, featureTypes) {
  const config = useRuntimeConfig();
  const { data } = useAuth();
  const token = data.value?.accessToken;
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
  let res;
  const url = new URL(`${config.public.geonodeUrl}/gs/ows`);
  url.search = new URLSearchParams(params).toString();

  if (token) {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(url);
  }
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  const blob = await res.blob();
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.target = '_blank';
  anchor.download = `${resource.title}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
/**
 * Hace una petición WFS para obtener la lista de Features y la geometría.
 * Las peticiones pueden ser autenticadas o no.
 * @param {Object} resource
 * @param {String} format
 * @returns
 */
export async function downloadNoGeometry(resource, format) {
  const config = useRuntimeConfig();
  const { data } = useAuth();
  const token = data.value?.accessToken;
  // Revisamos si la capa es remota
  if (resource.sourcetype === 'remote') {
    alert('Esta capa es remota y no se puede descargar');
    return;
  }
  // Si la capa no es remota, revisamos sus columnas para excluir las de geometria
  const describeFeatureUrl = new URL(`${config.public.geonodeUrl}/gs/ows`);
  describeFeatureUrl.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'DescribeFeatureType',
    typeName: resource.alternate,
    outputFormat: 'application/json',
  }).toString();

  //const res = await fetch(describeFeatureUrl);
  let res;
  if (token) {
    res = await fetch(describeFeatureUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(describeFeatureUrl);
  }
  //console.log(res);
  if (!res.ok) {
    return 'Error';
  }
  const fileData = await res.json();
  const features = fileData.featureTypes[0]['properties'];
  const props = features
    .filter((prop) => prop.name.toLowerCase() !== 'geometry')
    .map((prop) => prop.name);
  // Llamamos la función de descarga
  downloadWMS(resource, format, props.join());
}

/**
 * Hace una peticióon WMS para descargar una capa tipo raster en formato geotiff
 * @param {Object} resource
 */
export async function downloadRaster(resource) {
  //const urlArray = resource.download_urls.filter((link) => link.url.includes('/assets/'));
  //const url = urlArray[0].url;
  //const config = useRuntimeConfig();
  //const url = `${config.public.geonodeUrl}/datasets/${resource.alternate}/dataset_download`;
  const config = useRuntimeConfig();
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const pngObject = resource.links.filter((link) => link.name === 'PNG');
  const pngLink = pngObject[0].url;
  const paramsDict = {};
  const paramsList = pngLink.replace(`${config.public.geoserverUrl}/ows?`, '').split('&');
  paramsList.forEach((param) => {
    const entry = param.split('=');
    paramsDict[entry[0]] = entry[1];
  });
  const coords = resource.extent.coords;
  const bboxRatio = (coords[3] - coords[1]) / (coords[2] - coords[0]);
  //const url = new URL(`${config.public.geoserverUrl}/geonode/wms`);
  const url = new URL(`${config.public.geonodeUrl}/gs/wms`);
  url.search = new URLSearchParams({
    service: 'WMS',
    version: '1.1.0',
    request: 'GetMap',
    layers: resource.alternate,
    bbox: resource.extent.coords.join(','),
    width: Math.round(paramsDict.width * 1.5),
    height: Math.round(paramsDict.height * bboxRatio * 1.5),
    srs: resource.extent.srid,
    styles: '',
    format: 'image/geotiff',
  });
  let res;
  if (token) {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    res = await fetch(url);
  }
  const blob = await res.blob();
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.target = '_blank';
  anchor.download = `${resource.title}.tiff`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
