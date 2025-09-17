<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { findServer, hasWMS } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeConsulta = useConsultaStore();
const storeSelected = useSelectedResources2Store();
const emit = defineEmits(['opacidadClicked', 'descargaClicked', 'tablaClicked']);

const props = defineProps({
  resourceElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceElement } = toRefs(props);
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
      return storeSelected.byUuid(resourceElement.value.uuid)?.visible
        ? 'pictograma-ojo-ver'
        : 'pictograma-ojo-ocultar';
    },
    get globo() {
      return storeSelected.byUuid(resourceElement.value.uuid)?.visible
        ? 'Ocultar capa'
        : 'Mostrar capa';
    },
    action: () => {
      storeSelected.byUuid(resourceElement.value.uuid).toggleVisibility();
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
    excludeFor: 'none',
    label: 'Vínculo WMS',
    pictogram: 'pictograma-enlace-externo',
    globo: 'WMS',
    globo: 'WFS',
    action: async () => {
      //console.log(resourceElement.value.links);
      //const objectWMSLink = resourceElement.value.links.find((link) => link.name === 'PNG');
      //const wmsLink = objectWMSLink.url;
      const objectWFSLink = resourceElement.value.links.find((link) => link.name === 'GeoJSON');
      const wfsLink = objectWFSLink.url;

      try {
        await navigator.clipboard.writeText(wfsLink);
        alert('Enlace copiado al portapapeles: ' + wfsLink);
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
      storeSelected.removeByUuid(resourceElement.value.uuid);
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
    buttons = buttons.filter((d) => d.excludeFor !== 'remotes');
    const resourceHasWMS = await hasWMS(resourceElement.value, 'table', config.public.geonodeUrl);
    if (resourceHasWMS === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  actualButtons.value = buttons;
}
updateFunctions();
watch(resourceElement, () => {
  updateFunctions();
});

const { gnoxyFetch } = useGnoxyUrl();
</script>

<template>
  <div>
    <!-- El contenido de la tarjeta de capas -->
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
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
