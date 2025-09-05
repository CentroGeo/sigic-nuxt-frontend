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
  const { data } = useAuth();
  const token = data.value?.accessToken;

  const fetchTable = async ({ paginaActual, tamanioPagina, resource }) => {
    let url = '';
    if (!resource || resource.sourcetype !== 'REMOTE') {
      url = new URL(`${config.public.geonodeUrl}/gs/ows`);
    } else if (resource.sourcetype === 'REMOTE') {
      const wmsStatus = await hasWMS(resource, 'table');
      if (wmsStatus) {
        const link = getWMSserver(resource);
        url = new URL(link);
      }
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
      //const res = await fetch(url);
      let res;
      if (resource.sourcetype === 'REMOTE' || !token) {
        res = await fetch(url);
      } else if (token) {
        res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        //console.log(res);
      }
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
