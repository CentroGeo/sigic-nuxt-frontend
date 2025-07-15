<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);
const modalTabla = ref(null);

const optionsButtons = ref([
  {
    label: "Hacer zoom",
    pictogram: "pictograma-zoom-instruccional",
    action: () => {
      console.log("hacer zoom");
    },
  },
  {
    label: "Ver tablas",
    pictogram: "pictograma-tabla",
    action: () => {
      modalTabla.value?.abrirModal();
    },
  },
  {
    label: "Mostrar",
    pictogram: "pictograma-ojo-ver",
    action: () => {
      console.log("Mostrar u ocultar la capa");
    },
  },
  {
    label: "Cambiar opacidad",
    pictogram: "pictograma-editar",
    action: () => {
      console.log("cambiar opacidad");
    },
  },
  {
    label: "Eliminar selección",
    pictogram: "pictograma-eliminar",
    action: () => {
      resourcesStore.removeResource(resourceType.value, selectedElement.value);
    },
  },
  {
    label: "Descargar archivo",
    pictogram: "pictograma-archivo-descargar",
    action: () => {
      console.log("Descargar el archivo");
    },
  },
]);
const paginaActual = ref(0);
const tamanioPagina = 10;
const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: selectedElement.value,
});

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});
</script>
<template>
  <SisdaiModal ref="modalTabla">
    <template #encabezado>
      <h1>{{ selectedElement.title }}</h1>
    </template>

    <template #cuerpo>
      <UiTablaAccesible :variables="variables" :datos="datos" />
      <UiPaginador
        :totalPaginas="Math.ceil(totalFeatures / tamanioPagina)"
        @cambio="paginaActual = $event"
      />
    </template>
  </SisdaiModal>

  <!-- El contenido de la tarjeta de capas  -->
  <div class="m-b-5">
    <p class="tarjeta-titulo m-y-2">
      {{ selectedElement.title }}
    </p>
    <p class="tarjeta-etiqueta">Variables disponibles</p>
  </div>

  <div class="flex flex-contenido-final">
    <button
      v-for="button in optionsButtons"
      class="boton-pictograma boton-sin-contenedor-secundario"
      :aria-label="button.label"
      type="button"
      @click="button.action"
    >
      <span :class="button.pictogram" aria-hidden="true"></span>
    </button>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
