// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
// TODO: Manejo de errores en la petición
import { getWMSserver, hasWMS } from '@/utils/consulta';
import { ref } from 'vue';

export function useGeoserverDataTable({ paginaActual, tamanioPagina, resource } = {}) {
  const config = useRuntimeConfig();
  const variables = ref([]);
  const datos = ref([]);
  const totalFeatures = ref(0);

  const fetchTable = async ({ paginaActual, tamanioPagina, resource }) => {
    let url = '';
    if (resource.sourcetype === 'REMOTE') {
      const wmsStatus = await hasWMS(resource);
      if (wmsStatus) {
        const link = getWMSserver(resource);
        url = new URL(link);
      }
    } else {
      url = new URL(`${config.public.geoserverUrl}/ows`);
    }
    if (resource) {
      url.search = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: resource.alternate,
        outputFormat: 'application/json',
        maxFeatures: tamanioPagina,
        startIndex: paginaActual * tamanioPagina,
      }).toString();
      const res = await fetch(url);
      const data = await res.json();
      if (data.totalFeatures !== undefined) {
        totalFeatures.value = data.totalFeatures;
      }
      const atributos = data.features.map((f) => f.properties);
      variables.value = Object.keys(atributos[0] || {});
      datos.value = atributos;
    }
  };

  fetchTable({ paginaActual, tamanioPagina, resource });
  return {
    variables,
    datos,
    totalFeatures,
    refetch: fetchTable,
  };
}
