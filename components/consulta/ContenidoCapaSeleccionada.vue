<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { findServer, getWMSserver, hasWMS } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeConsulta = useConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
//const { findServer } = useGnoxyUrl();
//const { gnoxyUrl } = useGnoxyUrl();
const emit = defineEmits(['opacidadClicked', 'descargaClicked', 'tablaClicked']);
const props = defineProps({
  resourceElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceElement } = toRefs(props);

/* function getWFS(resource) {
  let url;
  if (resource.sourcetype === 'REMOTE') {
    url = new URL(getWMSserver(resource));
    url.search = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: resource.alternate,
      outputFormat: 'application/json',
    }).toString();
    url = url.href;
  } else {
    const objectWFSLink = resourceElement.value.links.find((link) => link.name === 'GeoJSON');
    url = objectWFSLink.url;
  }
  return url;
} */
/* function getWMSFeatureInfo(resource) {
  const url = new URL(getWMSserver(resource));
  const pngObject = resource.links.find((link) => link.name === 'PNG');
  const pngLink = pngObject.url;
  const paramsDict = {};
  const paramsList = pngLink.replace(`${config.public.geoserverUrl}/ows?`, '').split('&');
  paramsList.forEach((param) => {
    const entry = param.split('=');
    paramsDict[entry[0]] = entry[1];
  });
  const coords = resource.extent.coords;
  const bboxRatio = (coords[3] - coords[1]) / (coords[2] - coords[0]);
  const mapWidth = Math.round(paramsDict.width);
  const mapHeight = Math.round(paramsDict.height * bboxRatio);
  url.search = new URLSearchParams({
    service: 'WMS',
    version: '1.1.0',
    request: 'GetFeatureInfo',
    layers: resource.alternate,
    styles: '',
    srs: resource.extent.srid,
    bbox: resource.extent.coords.join(','),
    width: mapWidth,
    height: mapHeight,
    query_layers: resource.alternate,
    x: Math.round(mapWidth / 2),
    y: Math.round(mapHeight / 2),
    info_format: 'application/json',
  });
  return url.href;
} */
const actualButtons = ref({});
const optionsButtons = ref([
  {
    excludeFor: 'none',
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    globo: 'Zoom a la capa',
    action: () => {
      storeConsulta.mapExtent = resourceElement.value.extent.coords.join(',');
    },
  },
  {
    excludeFor: 'noTables',
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    globo: 'Ver tabla',
    action: () => {
      emit('tablaClicked');
    },
  },
  {
    excludeFor: 'none',
    label: 'Mostrar',
    get pictogram() {
      return storeSelected.byPk(resourceElement.value.pk)?.visible
        ? 'pictograma-ojo-ver'
        : 'pictograma-ojo-ocultar';
    },
    get globo() {
      return storeSelected.byPk(resourceElement.value.pk)?.visible
        ? 'Ocultar capa'
        : 'Mostrar capa';
    },
    action: () => {
      storeSelected.byPk(resourceElement.value.pk).toggleVisibility();
    },
  },
  {
    excludeFor: 'none',
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    globo: 'Opacidad',
    action: () => {
      emit('opacidadClicked');
    },
  },
  {
    excludeFor: 'noTables',
    label: 'Vínculo OWS',
    pictogram: 'pictograma-enlace-externo',
    globo: 'OWS',
    action: async () => {
      // Este primer link es una petición GetMap
      //const objectWMSLink = resourceElement.value.links.find((link) => link.name === 'PNG');
      //const wmsLink = objectWMSLink.url;
      // Esta es la petición WFS
      //const wfsLink = getWFS(resourceElement.value);
      // Esta es la petición GetFeatureInfo
      //const wmsLink = getWMSFeatureInfo(resourceElement.value);
      let server;
      if (resourceElement.value.sourcetype === 'REMOTE') {
        server = getWMSserver(resourceElement.value).split('/ows')[0];
      } else {
        server = `${config.public.geoserverUrl}`;
      }
      const owsLink = `${server}/${resourceElement.value.alternate.replace(':', '/')}/ows`;
      try {
        await navigator.clipboard.writeText(owsLink);
        alert('Enlace copiado al portapapeles: ' + owsLink);
      } catch (err) {
        console.error('Error al copiar: ', err);
      }
    },
  },
  {
    excludeFor: 'none',
    label: 'Eliminar selección',
    pictogram: 'pictograma-eliminar',
    globo: 'Eliminar',
    action: () => {
      storeSelected.removeByPk(resourceElement.value.pk);
    },
  },
  {
    excludeFor: 'remotes',
    label: 'Descargar archivo',
    pictogram: 'pictograma-archivo-descargar',
    globo: 'Descargar',
    action: () => {
      emit('descargaClicked');
    },
  },
]);

async function updateFunctions() {
  let buttons = optionsButtons.value;
  if (resourceElement.value.subtype === 'raster') {
    buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
  }
  if (resourceElement.value.sourcetype === 'REMOTE') {
    // Se excluye el botón de descargar para remotos
    buttons = buttons.filter((d) => d.excludeFor !== 'remotes');
    // Se excluye el botón OWS para remotos
    //buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
    //console.log(resourceElement.value);
    const resourceHasWMS = await hasWMS(resourceElement.value, 'table');
    // Esta se llamaría para el WFS*/
    /*     const resourceHasWMS = await hasWMS(
      resourceElement.value,
      'table',
      config.public.geonodeUrl,
      'GetFeatureInfo'
    );*/
    // Se excluye el botón para ver tablas en caso de que el archivo remoto no permita consultar la tabla
    if (resourceHasWMS === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  if (
    /* isLoggedIn.value &&
    resourceElement.value.owner.email === userEmail.value &&
    !resourceElement.value.is_published */
    resourceElement.value.is_approved === false &&
    resourceElement.value.is_published === false
  ) {
    // Se excluye el botón OWS para recursos privados
    buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
  }
  actualButtons.value = buttons;
}
updateFunctions();
watch(resourceElement, () => {
  updateFunctions();
});
</script>

<template>
  <div v-if="resourceElement.title">
    <div class="m-y-2">
      <SisdaiLeyendaWms
        :consulta="gnoxyFetch"
        :fuente="findServer(resourceElement)"
        :nombre="resourceElement.alternate"
        :titulo="resourceElement.title || 'cargando...'"
        :sin-control="true"
        :sin-control-clases="true"
      />
    </div>

    <div v-if="resourceElement.title" class="flex flex-contenido-final">
      <button
        v-for="button in actualButtons"
        :key="button.label"
        v-globo-informacion:derecha="button.globo"
        class="boton-pictograma boton-sin-contenedor-secundario"
        :aria-label="button.label"
        type="button"
        @click="button.action"
      >
        <span :class="button.pictogram" aria-hidden="true" />
      </button>
    </div>
  </div>
  <div v-else class="flex flex-contenido-centrado">
    <img src="/img/loader.gif" alt="...Cargando" height="50px" />
  </div>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
