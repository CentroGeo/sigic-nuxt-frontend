// Este composable hace peticiones de datos a Geonode
// TODO: Resolver las peticiones de información para mostrar capas y datasets privados
// TODO: Manejo de errores en la petición
import { ref } from 'vue';
import { buildArcgisLayerRequest, getWMSserver } from '~/utils/consulta';

export function useGeoserverDataTable({ paginaActual, tamanioPagina, resource } = {}) {
  const config = useRuntimeConfig();
  const { gnoxyFetch } = useGnoxyUrl();
  const variables = ref([]);
  const datos = ref([]);
  const totalFeatures = ref(0);
  let serverType = null;

  const fetchTable = async ({ paginaActual, tamanioPagina, resource }) => {
    let url = '';
    if (!resource || resource.sourcetype !== 'REMOTE') {
      url = new URL(`${config.public.geonodeUrl}/gs/ows`);
      serverType = 'WMS';
    } else if (resource.sourcetype === 'REMOTE') {
      const link = getWMSserver(resource);
      url = await buildArcgisLayerRequest(resource);

      if (link.includes('arcgis')) {
        serverType = 'ArcGis';
      } else {
        url = new URL(link);
        serverType = 'WMS';
      }
    }

    if (resource && serverType === 'WMS') {
      url.search = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: resource.alternate,
        outputFormat: 'application/json',
        maxFeatures: tamanioPagina,
        startIndex: paginaActual * tamanioPagina,
      }).toString();
      const res = await gnoxyFetch(url.href);
      const data = await res.json();
      if (data.totalFeatures !== undefined) {
        totalFeatures.value = data.totalFeatures;
      }
      const atributos = data.features.map((f) => f.properties);
      variables.value = Object.keys(atributos[0] || {});
      datos.value = atributos;
    }

    if (resource && serverType === 'ArcGis') {
      const newUrl = url.replace('MapServer', 'FeatureServer') + 'query/';
      const featureUrl = new URL(newUrl);
      featureUrl.search = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        resultRecordCount: tamanioPagina,
        resultOffset: paginaActual * tamanioPagina,
        f: 'json',
      });

      const totalRes = await gnoxyFetch(`${featureUrl.href}&returnCountOnly=true`);
      const totalData = await totalRes.json();
      totalFeatures.value = totalData.count;
      console.log('Total Res', totalData.count);
      const attrRes = await gnoxyFetch(featureUrl.href);
      const attrsData = await attrRes.json();
      variables.value = attrsData.fields.map((d) => d.name);
      datos.value = attrsData.features.map((d) => d.attributes);
    }
    console.log('Variables:', variables.value);
    console.log('datos:', datos.value);
  };

  fetchTable({ paginaActual, tamanioPagina, resource });
  return {
    variables,
    datos,
    totalFeatures,
    refetch: fetchTable,
  };
}
