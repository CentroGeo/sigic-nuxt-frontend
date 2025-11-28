<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { findServer, getWMSserver, hasWMS } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeConsulta = useConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
const emit = defineEmits(['opacidadClicked', 'descargaClicked', 'tablaClicked', 'owsClicked']);
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
    const resourceHasWMS = await hasWMS(resourceElement.value, 'table');
    // Se excluye el botón para ver tablas en caso de que el archivo remoto no permita consultar la tabla
    if (resourceHasWMS === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  if (resourceElement.value.is_approved === false && resourceElement.value.is_published === false) {
    // Se excluye el botón OWS para recursos privados
    buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
  }
  actualButtons.value = buttons;
}
updateFunctions();

async function shareOws() {
  let server;
  if (resourceElement.value.sourcetype === 'REMOTE') {
    server = getWMSserver(resourceElement.value).split('/ows')[0];
  } else {
    server = `${config.public.geoserverUrl}`;
  }
  const owsLink = `${server}/${resourceElement.value.alternate.replace(':', '/')}/ows`;
  emit('owsClicked', owsLink);
}
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
    <div v-if="resourceElement.is_published === true" class="flex flex-contenido-centrado m-t-2">
      <button
        type="button"
        class="boton-secundario boton-chico columna-16 flex flex-contenido-centrado"
        aria-label="Enlace Open Web Services"
        @click="shareOws"
      >
        Enlace Open Web Services (OWS)
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
