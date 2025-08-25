<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';

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

const optionsButtons = ref([
  {
    for: 'all',
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    globo: 'Zoom a la capa',
    action: () => {
      storeConsulta.mapExtent = props.resourceElement.extent.coords.join(',');
    },
  },
  {
    for: 'vector',
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    globo: 'Ver tabla',
    action: () => {
      emit('tablaClicked');
    },
  },
  {
    for: 'all',
    label: 'Mostrar',
    get pictogram() {
      return storeSelected.byUuid(props.resourceElement.uuid)?.visible
        ? 'pictograma-ojo-ver'
        : 'pictograma-ojo-ocultar';
    },
    get globo() {
      return storeSelected.byUuid(props.resourceElement.uuid)?.visible
        ? 'Ocultar capa'
        : 'Mostrar capa';
    },
    action: () => {
      storeSelected.byUuid(props.resourceElement.uuid).toggleVisibility();
    },
  },
  {
    for: 'all',
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    globo: 'Opacidad',
    action: () => {
      emit('opacidadClicked');
    },
  },
  {
    for: 'all',
    label: 'Eliminar selección',
    pictogram: 'pictograma-eliminar',
    globo: 'Eliminar',
    action: () => {
      storeSelected.removeByUuid(props.resourceElement.uuid);
    },
  },
  {
    for: 'all',
    label: 'Descargar archivo',
    pictogram: 'pictograma-archivo-descargar',
    globo: 'Descargar',
    action: () => {
      emit('descargaClicked');
    },
  },

  {
    for: 'all',
    label: 'Mover a la izquierda',
    get pictogram() {
      return lado.value === 'izquierda'
        ? 'pictograma-flechas-horizontales'
        : 'pictograma-flecha-izquierda';
    },
    globo: 'Mover a la izquierda',
    action: () => {
      lado.value = lado.value === 'izquierda' ? undefined : 'izquierda';
    },
  },
  {
    for: 'all',
    label: 'Mover a la derecha',
    get pictogram() {
      return lado.value === 'derecha'
        ? 'pictograma-flechas-horizontales'
        : 'pictograma-flecha-derecha';
    },
    // pictogram: 'pictograma-flecha-derecha',
    globo: 'Mover a la derecha',
    action: () => {
      lado.value = lado.value === 'derecha' ? undefined : 'derecha';
    },
  },
]);

const lado = computed({
  get: () => storeSelected.byUuid(props.resourceElement.uuid)?.lado,
  set: (nuevoValor) => (storeSelected.byUuid(props.resourceElement.uuid).lado = nuevoValor),
});
const actualButtons = computed(() =>
  props.resourceElement.subtype === 'raster'
    ? optionsButtons.value.filter((d) => d.for === 'all')
    : optionsButtons.value
);
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
