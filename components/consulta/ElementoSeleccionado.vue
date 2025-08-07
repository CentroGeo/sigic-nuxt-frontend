<script setup>
import { tooltipContent } from '~/utils/consulta';

const storeFetched = useFetchedResourcesStore();
const storeSelected = useSelectedResources2Store();

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => {},
  },
  resourceType: { type: String, required: true },
});

const resourceElement = computed(() =>
  storeFetched.findResource(props.selectedElement.uuid, props.resourceType)
);
// const resourceElement = storeFetched.findResource(props.selectedElement.uuid, props.resourceType);}
const emit = defineEmits(['openOpacity', 'openDownload', 'openTabla', 'openMapa']);
/* const posicion = computed({
  get: () => selectedStore.findResource(uuid, props.resourceType).posicion,
  set: (nuevaPosicion) =>
    (selectedStore.findResource(uuid, props.resourceType).posicion = nuevaPosicion),
}); */

function goDown() {
  storeSelected.changePosition(props.selectedElement.uuid, -1);
}
function goUp() {
  storeSelected.changePosition(props.selectedElement.uuid, +1);
}
</script>

<template>
  <div class="tarjeta m-y-1">
    <div class="tarjeta-selected">
      <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
        <p class="tarjeta-texto-secundario m-0">Categoria</p>

        <div class="m-0">
          <button
            v-globo-informacion:izquierda="{
              contenido: tooltipContent(resourceElement || {}),
              desfase: [0, 8],
            }"
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Mostrar información"
            type="button"
          >
            <span class="pictograma-informacion pictograma-mediano" aria-hidden="true" />
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Subir elemento"
            type="button"
            :disabled="storeSelected.uuids.length === selectedElement.posicion + 1"
            @click="goUp"
          >
            <span class="pictograma-subir-capa pictograma-mediano" aria-hidden="true" />
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Bajar Elemento"
            type="button"
            :disabled="selectedElement.posicion === 0"
            @click="goDown"
          >
            <span class="pictograma-bajar-capa pictograma-mediano" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ConsultaContenidoCapaSeleccionada
        v-if="resourceType === 'dataLayer'"
        :resource-type="resourceType"
        :resource-element="resourceElement"
        @opacidad-clicked="emit('openOpacity', props.selectedElement)"
        @descarga-clicked="emit('openDownload', props.selectedElement)"
        @tabla-clicked="emit('openTabla', props.selectedElement)"
      />

      <ConsultaContenidoDocSeleccionado
        v-else
        :group-name="resourceType"
        :resource-type="resourceType"
        :selected-element="selectedElement"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tarjeta-selected {
  padding: 16px;
  background-color: var(--color-secundario-2);
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
.encabezado-tarjeta {
  align-items: center;
}
</style>
