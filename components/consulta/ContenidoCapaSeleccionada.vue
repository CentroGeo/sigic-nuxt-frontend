<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();
const storeConsulta = useConsultaStore();
const storeSelected = useSelectedResources2Store();

const props = defineProps({
  resourceElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { uuid } = props.resourceElement;

const tablaChild = ref(null);
const downloadChild = ref(null);
const opacityChild = ref(null);

function notifyTabla() {
  tablaChild.value?.abrirModalTabla();
}
function notifyDownloadChild() {
  downloadChild.value?.abrirModalDescarga();
}

function notifyOpacityChild() {
  opacityChild.value.abrirModalOpacidad();
}
function downloadFromTabla() {
  // console.log('el padre se enteró');
  downloadChild.value?.abrirModalDescarga();
}
/**
 * Devuelve el extend de acuerdo a una capa en formato: left,bootom,rigth,top
 * @param {Array} bboxPolygon arreglo de corrdenadas envolventes de la capa
 * @returns {Array} left,bootom,rigth,top
 */
function getExtent(bboxPolygon) {
  if (!Array.isArray(bboxPolygon)) {
    console.error(
      'El valor de la extensión no está definida o no es una lista de coordenadas:',
      bboxPolygon
    );

    return [];
  }

  const x = bboxPolygon.map(([x]) => x);
  const y = bboxPolygon.map(([, y]) => y);
  return [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)].join(',');
}

// Aqui se acaba la parte nueva para la prueba
const optionsButtons = ref([
  {
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    action: () => {
      storeConsulta.mapExtent = getExtent(props.resourceElement.bbox_polygon.coordinates[0]);
      // storeConsulta.ajustarExtensionMapa = getExtent(
      //   props.resourceElement.bbox_polygon.coordinates[0]
      // );
    },
  },
  {
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    action: () => {
      notifyTabla();
    },
  },
  {
    label: 'Mostrar',
    get pictogram() {
      return storeSelected.resource(uuid).visible ? 'pictograma-ojo-ver' : 'pictograma-ojo-ocultar';
    },
    action: () => {
      storeSelected.resource(uuid).visible = !storeSelected.resource(uuid).visible;
    },
  },
  {
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    action: () => {
      notifyOpacityChild();
    },
  },
  {
    label: 'Eliminar selección',
    pictogram: 'pictograma-eliminar',
    action: () => {
      storeSelected.removeResource(props.resourceElement.uuid);
    },
  },
  {
    label: 'Descargar archivo',
    pictogram: 'pictograma-archivo-descargar',
    action: () => {
      notifyDownloadChild();
    },
  },
]);
</script>

<template>
  <div>
    <!-- El contenido de la tarjeta de capas -->
    <div class="m-y-2">
      <SisdaiLeyendaWms
        :nombre="resourceElement.alternate"
        :fuente="`${config.public.geoserverUrl}/wms?`"
        :titulo="resourceElement.title || 'cargando...'"
        :sin-control="true"
        :sin-control-clases="true"
      />
    </div>

    <div class="flex flex-contenido-final">
      <button
        v-for="button in optionsButtons"
        :key="button.label"
        class="boton-pictograma boton-sin-contenedor-secundario"
        :aria-label="button.label"
        type="button"
        @click="button.action"
      >
        <span :class="button.pictogram" aria-hidden="true" />
      </button>
    </div>
    <!-- Los modales-->
    <ConsultaModalTabla
      ref="tablaChild"
      :selected-element="resourceElement"
      @click-download="downloadFromTabla"
    />
    <ConsultaModalDescarga
      ref="downloadChild"
      :resource-type="resourceType"
      :selected-element="resourceElement"
    />
    <ConsultaModalOpacidad ref="opacityChild" :selected-element="resourceElement" />
  </div>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
