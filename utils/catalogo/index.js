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
