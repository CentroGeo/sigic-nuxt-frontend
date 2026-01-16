<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import SisdaiLeyendaArcgis from '@centrogeomx/sisdai-mapas/src/componentes/leyenda/arcgis';
import { findServer, getWMSserver, hasFeatureServer, hasWFS } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeConsulta = useConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
const emit = defineEmits([
  'opacidadClicked',
  'descargaClicked',
  'tablaClicked',
  'owsClicked',
  'resourceReady',
]);
const props = defineProps({
  resourceElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceElement } = toRefs(props);
const isResourceReady = ref(false);
const selectedStyle = ref(null);
const actualButtons = ref({});
const serverType = ref(null);
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

async function updateFunctions() {
  // Primero averiguamos el tipo de servidor
  serverType.value = findServer(resourceElement.value).includes('arcgis') ? 'arcgis' : 'ogc';
  let buttons = optionsButtons.value;
  if (resourceElement.value.subtype === 'raster') {
    buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
  }
  if (resourceElement.value.sourcetype === 'REMOTE') {
    // Se excluye el botón de descargar para remotos
    buttons = buttons.filter((d) => d.excludeFor !== 'remotes');

    // Averiguamos si podemos consumir la tabla de atribunos o no
    let hasTable;
    if (serverType.value === 'arcgis') {
      hasTable = await hasFeatureServer(resourceElement.value);
    } else {
      hasTable = await hasWFS(resourceElement.value, 'table');
    }
    if (hasTable === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  // Se excluye el botón OWS para recursos privados
  if (resourceElement.value.is_approved === false && resourceElement.value.is_published === false) {
    buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
  }
  actualButtons.value = buttons;
}

watch(resourceElement, async () => {
  await updateFunctions();
  isResourceReady.value = true;
  selectedStyle.value = storeSelected.byPk(resourceElement.value.pk).estilo;
  emit('resourceReady');
});

onMounted(async () => {
  if (resourceElement.value.title) {
    await updateFunctions();
    isResourceReady.value = true;

    emit('resourceReady');
  }
});

watch(selectedStyle, (nv) => {
  storeSelected.byPk(resourceElement.value.pk).estilo = nv;
});

/* watch(selectedStyle, (nv) => {
  console.log(nv);
}); */
</script>

<template>
  <div v-if="isResourceReady">
    <div v-if="resourceElement.styles.length > 1" class="m-t-2">
      <ClientOnly>
        <SisdaiSelector
          v-model="selectedStyle"
          etiqueta="Variables disponibles"
          texto_ayuda="Texto de ayuda."
        >
          <option v-for="estilo in resourceElement.styles" :key="estilo" :value="estilo">
            {{ estilo }}
          </option>
        </SisdaiSelector>
      </ClientOnly>
    </div>
    <div class="m-y-2">
      <SisdaiLeyendaWms
        v-if="serverType != 'arcgis'"
        :consulta="gnoxyFetch"
        :fuente="findServer(resourceElement)"
        :estilo="storeSelected.byPk(resourceElement.pk).estilo"
        :nombre="resourceElement.alternate"
        :titulo="resourceElement.title || 'cargando...'"
        :sin-control="true"
        :sin-control-clases="true"
      />
      <SisdaiLeyendaArcgis
        v-else
        :capa="resourceElement.alternate.split(':')[1]"
        :fuente="findServer(resourceElement).replace('?', '')"
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
    <img src="/img/loader.gif" class="color-invertir" alt="...Cargando" height="50px" />
  </div>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
