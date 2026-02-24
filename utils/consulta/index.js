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
  climatologyMeteorologyAtmosphere: 'Climatology Meteorology Atmosphere',
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
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Formatea el para keuwords
 * @param {String} input
 * @returns {String} El input formateado
 */
export function unaccentUppercase(input) {
  return input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
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
