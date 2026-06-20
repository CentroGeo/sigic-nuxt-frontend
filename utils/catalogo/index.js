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
    tipo: 'GN_WMS',
    origen: 'mide+',
    origen_url: 'https://mide.monterrey.gob.mx/',
    service_url: 'https://mide.monterrey.gob.mx/geoserver/ows',
  },
  {
    id: 3,
    total_resources: 137,
    title: 'CEIEG Chiapas',
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
    descripcion:
      'La IDE SEDATU funciona como un nodo de información geoespacial que facilita la visualización de capas cartográficas mediante visores web, así como el acceso a conjuntos de datos estructurados que apoyan la planeación territorial.',
    abstract: `La Infraestructura de Datos Espaciales de la Secretaría de Desarrollo Agrario, Territorial y Urbano (IDE SEDATU) es una plataforma tecnológica diseñada para integrar, organizar y difundir información geográfica relacionada con el territorio, el desarrollo urbano y la vivienda en México. Su propósito principal es concentrar en un solo entorno digital los datos espaciales generados por la dependencia, permitiendo su consulta, análisis y aprovechamiento tanto por usuarios institucionales como por el público en general.`,
    tipo: 'GN_WMS',
    etiquetas: 'Etiqueta',
    origen: 'Secretaría de Desarrollo Agrario, Territorial y Urbano',
    origen_url: 'https://www.gob.mx/sedatu',
    service_url: 'https://ide.sedatu.gob.mx/geoserver/geonode/wms',
  },
  {
    id: 5,
    total_resources: 0,
    title: 'SITU SEDATU',
    descripcion:
      'El SITU permite acceder a más de dos mil capas de información pública para contribuir a la toma de decisiones e investigación sobre la política territorial.',
    abstract: `El SITU (Sistema de Información Territorial y Urbano) es una herramienta valiosa para la toma de decisiones en materia de planeación territorial y desarrollo urbano, lo que permite diseñar e implementar políticas públicas más efectivas, ordenadas y sostenibles.`,
    etiquetas: 'Etiqueta',
    tipo: 'WMS',
    origen: 'SEDATU',
    origen_url: 'https://situ.sedatu.gob.mx/',
    service_url: 'https://situ.sedatu.gob.mx/descargas/geoserver/wms',
  },
  {
    id: 6,
    total_resources: 0,
    title: 'Geoportal GITS UNAM',
    descripcion: 'Geoportal del Grupo de Interacción Territorial y Sistemas (GITS) UNAM',
    abstract: `Servicio del Geoportal GITS UNAM.`,
    etiquetas: 'Etiqueta',
    tipo: 'WMS',
    origen: 'UNAM',
    origen_url: 'https://www.gits.igg.unam.mx/geoportal/home',
    service_url: 'https://www.gits.igg.unam.mx/geoportal/home',
  },
  {
    id: 7,
    total_resources: 0,
    title: 'CONAGUA SEMARNAT',
    descripcion:
      'El SINA es un sistema estadístico que presenta información con datos históricos actualizados.',
    abstract: `El Sistema Nacional de Información del Agua (SINA) es un instrumento para la gestión de la información estratégica de los recursos hídricos en México. En el SINA se integra, analiza y brinda información estadística y geográfica del sector hídrico proveniente de diversas áreas de la CONAGUA y de otras instituciones para apoyar la toma de decisiones en el diseño, implementación y seguimiento de políticas públicas para lograr una buena administración de las aguas nacionales y la seguridad hídrica de la población.`,
    etiquetas: 'Etiqueta',
    tipo: 'WMS',
    origen: 'CONAGUA',
    origen_url: 'https://www.gob.mx/conagua',
    service_url: 'https://geosinav30.conagua.gob.mx:8080/geoserver/wms',
  },
];

export const dictIdiomas = [
  { abk: 'Abjasio' },
  { aar: 'Afar' },
  { afr: 'Afrikáans' },
  { aym: 'Aimara' },
  { ger: 'Alemán' },
  { amh: 'Amárico' },
  { ara: 'Árabe' },
  { asm: 'Asamés' },
  { aze: 'Azerí' },
  { bak: 'Baskir' },
  { ben: 'Bengalí' },
  { bel: 'Bielorruso' },
  { bih: 'Bihari' },
  { bis: 'Bislama' },
  { bre: 'Bretón' },
  { bul: 'Búlgaro' },
  { kas: 'Cachemir' },
  { kan: 'Canarés' },
  { cat: 'Catalán' },
  { chi: 'Chino' },
  { twi: 'Chuí' },
  { sin: 'Cingalés' },
  { kor: 'Coreano' },
  { cos: 'Corso' },
  { dan: 'Danés' },
  { dzo: 'Dzongkha' },
  { slv: 'Esloveno' },
  { spa: 'Español ' },
  { epo: 'Esperanto' },
  { est: 'Estonio' },
  { fao: 'Faroés' },
  { fin: 'Finés' },
  { fij: 'Fiyiano' },
  { fra: 'Francés ' },
  { fry: 'Frisón' },
  { glg: 'Gallego' },
  { gre: 'Griego' },
  { kal: 'Groenlandés' },
  { grn: 'Guaraní' },
  { guj: 'Guyarati' },
  { hau: 'Hausa' },
  { heb: 'Hebreo ' },
  { hin: 'Hindi' },
  { hun: 'Húngaro' },
  { yid: 'Ídish' },
  { ind: 'Indonesio' },
  { eng: 'Inglés ' },
  { ina: 'Interlingua' },
  { iku: 'Inuktitut' },
  { ita: 'Italiano' },
  { ipk: 'Iñupiaq' },
  { jpn: 'Japonés ' },
  { khm: 'Jemer' },
  { kaz: 'Kazajo' },
  { kir: 'Kirguís' },
  { run: 'Kirundi' },
  { kin: 'Kiñaruanda' },
  { kur: 'Kurdo' },
  { lao: 'Laosiano' },
  { lat: 'Latín' },
  { lav: 'Letón' },
  { lin: 'Lingala' },
  { lit: 'Lituano' },
  { mlg: 'Malgache' },
  { mlt: 'Maltés' },
  { mar: 'Maratí' },
  { mol: 'Moldavo' },
  { mon: 'Mongol' },
  { nau: 'Nauruano' },
  { nep: 'Nepalí' },
  { nor: 'Noruego' },
  { oci: 'Occitano' },
  { ori: 'Odia' },
  { orm: 'Oromo' },
  { pus: 'Pastún' },
  { pol: 'Polaco' },
  { por: 'Portugués' },
  { pan: 'Punyabí' },
  { que: 'Quechua' },
  { roh: 'Retorrománico' },
  { rus: 'Ruso ' },
  { smo: 'Samoano' },
  { sag: 'Sango' },
  { scr: 'Serbocroata' },
  { sot: 'Sesotho' },
  { tsn: 'Setsuana' },
  { sna: 'Shona' },
  { snd: 'Sindi' },
  { som: 'Somalí' },
  { swa: 'Suajili' },
  { ssw: 'Suazilandés' },
  { sun: 'Sudanés' },
  { san: 'Sánscrito' },
  { tgl: 'Tagalo' },
  { tha: 'Tailandés' },
  { tam: 'Tamil' },
  { tgk: 'Tayiko' },
  { tir: 'Tigriña' },
  { tog: 'Tongano' },
  { tso: 'Tsonga' },
  { tur: 'Turco' },
  { tuk: 'Turcomano' },
  { tat: 'Tártaro' },
  { tel: 'Télugu' },
  { ukr: 'Ucraniano' },
  { uig: 'Uigur' },
  { urd: 'Urdu' },
  { uzb: 'Uzbeko' },
  { vie: 'Vietnamita' },
  { vol: 'Volapük' },
  { wol: 'Wólof' },
  { xho: 'Xhosa' },
  { yor: 'Yoruba' },
  { zha: 'Zhuang' },
  { zul: 'Zulu' },
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

export function convertirBytes(bytes) {
  const decimals = 2;
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'Kib', 'MiB', 'GiB', 'TiB', 'EiB', 'ZiB', ' YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
