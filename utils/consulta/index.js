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
export const categoriesNames = {
  biota: 'Biota',
  boundaries: 'Boundaries',
  climatologyMeteorologyAtmosphete: 'Climatology Meteorology Atmosphere',
  economy: 'Economy',
  elevation: 'Elevation',
  environment: 'Environment',
  farming: 'Farming',
  geoscientificInformation: 'Geoscientific Information',
  health: 'Health',
  imageryBaseMapsEarthCover: 'Imagery Base Maps Earth Cover',
  inlandWaters: 'Inland Waters',
  intelligenceMilitary: 'Intelligence Military',
  location: 'Location',
  oceans: 'Oceans',
  planningCadastre: 'Planning Cadastre',
  population: 'Population',
  society: 'Society',
  structure: 'Structure',
  transportation: 'Transportation',
  utilitiesCommunication: 'Utilities Communication',
};
export const categoriesValues = {
  Biota: 'biota',
  Boundaries: 'boundaries',
  'Climatology Meteorology Atmosphere': 'climatologyMeteorologyAtmosphere',
  Economy: 'economy',
  Elevation: 'elevation',
  Environment: 'environment',
  Farming: 'farming',
  'Geoscientific Information': 'geoscientificInformation',
  Health: 'health',
  'Imagery Base Maps Earth Cover': 'imageryBaseMapsEarthCover',
  'Inland Waters': 'inlandWaters',
  'Intelligence Military': 'intelligenceMilitary',
  Location: 'location',
  Oceans: 'oceans',
  'Planning Cadastre': 'planningCadastre',
  Population: 'population',
  Society: 'society',
  Structure: 'structure',
  Transportation: 'transportation',
  'Utilities Communication': 'utilitiesCommunication',
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
 * Espera el tiempo indicado para ejecutar la siguiente linea
 * @param {Number} miliseconds
 * @returns
 */
export async function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

/**
 * Esta función construye urls con queryparams
 * @param {String} server
 * @param {Object} query
 * @returns {String}
 */
export function buildUrl(endpoint, query) {
  const pruebaApi = endpoint;
  const dataParams = new URLSearchParams();
  const filtersDict = Object.keys(query);
  filtersDict.forEach((filter) => {
    const value = query[filter];
    if (typeof value === 'string' || typeof value === 'number') {
      dataParams.append(filter, value);
    } else if (Array.isArray(value)) {
      value.forEach((option) => dataParams.append(filter, option));
    }
  });

  const pruebaUrl = `${pruebaApi}?${dataParams.toString().replace('extent_ne=%5B-1%2C-1%2C0%2C0%5D', 'extent_ne=[-1,-1,0,0]')}`;
  return pruebaUrl;
}
/**
 * Regresa el servidor en el que esta alojado un recurso remoto
 * @param {Object} resource
 * @returns {String}
 */
export function getWMSserver(resource) {
  const wmsObject = resource.links.find((link) => link.link_type === 'OGC:WMS');
  const link = wmsObject['url'];
  return `${link.split('?')[0]}?`;
}
/**
 * Obtiene el servidor que aloja al recurso
 * @param {Object} resource
 * @returns {String}
 */
export function findServer(resource) {
  if (resource.sourcetype === 'REMOTE') {
    return getWMSserver(resource);
  } else {
    const config = useRuntimeConfig();
    return `${config.public.geonodeUrl}/gs/ows`;
  }
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
  const { gnoxyFetch } = useGnoxyUrl();
  const maxAttempts = 5;
  const url = new URL(findServer(resource));
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetCapabilities',
  });
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(url.toString());
      if (!res.ok) {
        console.error('Fracasó la petición getCapabilities');
        continue;
      }

      const data = await res.text();
      if (data.includes('ExceptionReport')) {
        console.error('No se puede usar el WMS', url, resource.alternate, resource.title);
        return false;
      }

      /*       if (requestType === 'GetFeatureInfo') {
        if (data.includes('GetFeatureInfo')) {
          return true;
        } else {
          return false;
        }
      } else {} */
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
 * Consulta al servidor que aloja un recurso remoto o de tipo vectorail para
 * obtener el tipo de geometria del mismo
 * @param {Object} resource
 * @param {String} server
 * @returns {String}
 */
export async function fetchGeometryType(resource) {
  const { gnoxyFetch } = useGnoxyUrl();
  const maxAttempts = 5;
  const url = new URL(findServer(resource));
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: resource.alternate,
    maxFeatures: 1,
    outputFormat: 'application/json',
  });

  // Ahora hacemos una petición get al vínculo statusLocation.
  // Como a veces hace timeout, lo intentamos tres veces
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(url.toString());
      if (!res.ok) {
        return 'Error';
      }
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
  }

  // Si fracasa en todos los intentos
  return 'Error';
}

/**
 * Define el tipo de geometría de un archivo de tipo dataset
 * sin importar si es remoto o local, raster o vectoria
 * @param {Object} resource
 * @returns
 */
export async function defineGeomType(resource) {
  let geomType;
  if (resource.sourcetype === 'REMOTE') {
    const resourceHasWMS = await hasWMS(resource, 'geometry');
    if (resourceHasWMS) {
      geomType = await fetchGeometryType(resource);
    } else {
      geomType = 'Remoto';
    }
  } else if (resource.subtype === 'raster') {
    geomType = 'Raster';
  } else if (resource.subtype === 'vector') {
    geomType = await fetchGeometryType(resource);
  } else {
    geomType = 'Otro';
  }
  return geomType;
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
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
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
      //window.open(newUrl);
      return newUrl;
    } catch {
      console.warn('Se está intentando una vez más');
    }
  }
  return 'Error';
}

/**
 * Identifica el link indicado, hace una petición autenticada y genera un nuevo link
 * para descargar un archivo pdf o txt
 * @param {Object} resource
 */
export async function downloadDocs(resource) {
  const { gnoxyFetch } = useGnoxyUrl();
  const maxAttempts = 5;
  const extension = resource.links?.find((link) => link.link_type === 'uploaded').extension;
  let url;
  if (extension === 'pdf') {
    url = resource.download_url;
  } else {
    url = resource.embed_url.replace('/embed', '/link');
  }
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(url);
      if (!res.ok) {
        //throw new Error(`Falló la descarga: ${res.status}`);
        return 'Error';
      }
      const blob = await res.blob();
      const newUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = newUrl;
      anchor.download = `${resource.title.replace('.pdf', '').replace('.txt', '')}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(newUrl);
      return 'Ok';
    } catch {
      console.warn(`Falló el intento ${attempt + 1}.`);
    }
  }
  return 'Error';
}

/**
 * Crea un link de para descargar los metadatos de un recurso
 * @param {Object} resource
 * @returns
 */
export async function downloadMetadata(resource) {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const maxAttempts = 5;
  const api = new URL(`${config.public.geonodeUrl}/catalogue/csw`);
  api.search = new URLSearchParams({
    request: 'GetRecordById',
    service: 'CSW',
    version: '2.0.2',
    id: resource.uuid,
    outputschema: 'http://www.isotc211.org/2005/gmd',
    elementsetname: 'full',
  }).toString();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(api.toString());
      if (!res.ok) {
        //throw new Error(`Falló la descarga: ${res.status}`);
        return 'Error';
      }
      const dataBlob = await res.blob();
      const blobLink = URL.createObjectURL(dataBlob);
      const anchor = document.createElement('a');
      anchor.href = blobLink;
      anchor.style.display = 'none';
      anchor.download = `${resource.title}_metadata.xml`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobLink);
      return 'Ok';
    } catch {
      console.warn(`Falló el intento ${attempt + 1}.`);
    }
  }
  return 'Error';
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
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const maxAttempts = 3;
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
  const url = new URL(`${config.public.geonodeUrl}/gs/ows`);
  url.search = new URLSearchParams(params).toString();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.warn(`Vamos en el intento: ${attempt}.`);
      const res = await gnoxyFetch(`${url}`);
      if (!res.ok) {
        //throw new Error(`Download failed: ${res.status}`);
        return 'Error';
      }
      //console.log('Estamos aquí');
      const blob = await res.blob();
      const anchor = document.createElement('a');
      const downloadUrl = URL.createObjectURL(blob);
      anchor.href = downloadUrl;
      //anchor.target = '_blank';
      anchor.style.display = 'none';
      anchor.download = `${resource.title}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
      return 'Ok';
    } catch {
      console.warn(`Falló el intento ${attempt + 1}.`);
    }
  }
  return 'Error';
}

/**
 * Hace una petición WFS para obtener la lista de Features y excluir la geometría.
 * Las peticiones pueden ser autenticadas o no.
 * @param {Object} resource
 * @param {String} format
 * @returns
 */
export async function getFeatures(resource) {
  const { gnoxyFetch } = useGnoxyUrl();
  const maxAttempts = 3;
  const describeFeatureUrl = new URL(findServer(resource));
  // Revisamos sus columnas para excluir las de geometria
  describeFeatureUrl.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'DescribeFeatureType',
    typeName: resource.alternate,
    outputFormat: 'application/json',
  }).toString();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(describeFeatureUrl.toString());
      if (!res.ok) {
        throw new Error(`getFeatures falló: ${res.status}`);
      }
      const fileData = await res.json();
      const features = fileData.featureTypes[0]['properties'];
      const props = features
        .filter(
          (prop) => prop.name.toLowerCase() !== 'geometry' && prop.name.toLowerCase() !== 'geom'
        )
        .map((prop) => prop.name);
      return props;
    } catch {
      console.warn(`Falló el intento ${attempt + 1}.`);
    }
  }
}

/**
 * Hace la descarga de los archivos sin geometría.
 * Las peticiones pueden ser autenticadas o no.
 * @param {Object} resource
 * @param {String} format
 * @returns
 */

export async function downloadNoGeometry(resource, format) {
  const props = await getFeatures(resource);
  const downloadStatus = downloadWMS(resource, format, props.join());
  return downloadStatus;
}

/**
 * Hace una petición para descargar una capa tipo raster en formato geotiff
 * @param {Object} resource
 */
export async function downloadRaster(resource) {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const maxAttempts = 3;
  let error = 'Error';
  const url = `${config.public.geonodeUrl}/datasets/${resource.alternate}/dataset_download`;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await gnoxyFetch(url.toString());
      if (!res.ok) {
        const errorData = await res.text();
        if (errorData.includes('Download Limits Exceeded')) {
          error = 'DownloadLimitsExceeded';
        } else {
          error = 'Error';
        }
        //console.error(error);
        return error;
      }
      const blob = await res.blob();
      const anchor = document.createElement('a');
      const downloadUrl = URL.createObjectURL(blob);
      anchor.href = downloadUrl;
      anchor.download = `${resource.title}.tiff`;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
      return 'Ok';
    } catch {
      console.warn(`Falló el intento ${attempt + 1}.`);
    }
  }
  console.warn(`La descarga fracasó después de ${maxAttempts} intentos`);
  return error;
}

/**
 * Devuelve las listas de elementos no encontrados en dos listas.
 * @param {Array<String>} list1
 * @param {Array<String>} list2
 * @returns {Object} objeto con dos propiedades:
 * - `news` -> elementos de list2 no entontrados en list1
 * - `olds` -> elementos de list1 no entontrados en list2
 */
export function arrayNewsOlds(list1, list2) {
  const news = list2.filter((item) => !list1.includes(item));
  const olds = list1.filter((item) => !list2.includes(item));

  return { news, olds };
}

/* export async function downloadRaster(resource) {
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
} */
