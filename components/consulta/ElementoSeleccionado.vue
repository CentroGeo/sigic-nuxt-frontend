<script setup>
import { resourceTypeDic, tooltipContent } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
const storeSelected = useSelectedResources2Store();
const emit = defineEmits(['openOpacity', 'openDownload', 'openTabla', 'openMapa']);

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

const goDown = () => storeSelected.changePosition(props.selectedElement.uuid, -1);
const goUp = () => storeSelected.changePosition(props.selectedElement.uuid, +1);
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
            v-globo-informacion:derecha="'Subir elemento'"
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Subir elemento"
            type="button"
            :disabled="storeSelected.uuids.length === selectedElement.posicion + 1"
            @click="goUp"
          >
            <span class="pictograma-subir-capa pictograma-mediano" aria-hidden="true" />
          </button>

          <button
            v-globo-informacion:derecha="'Bajar elemento'"
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
        v-if="resourceType === resourceTypeDic.dataLayer"
        :resource-type="resourceType"
        :resource-element="resourceElement"
        @opacidad-clicked="emit('openOpacity', resourceElement)"
        @descarga-clicked="emit('openDownload', resourceElement)"
        @tabla-clicked="emit('openTabla', resourceElement)"
      />

      <ConsultaContenidoDocSeleccionado
        v-else
        :group-name="resourceType"
        :resource-type="resourceType"
        :resource-element="resourceElement"
        @descarga-clicked="emit('openDownload', resourceElement)"
        @mapa-clicked="emit('openMapa', resourceElement)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tarjeta-selected {
  padding: 16px;
  background-color: var(--color-secundario-2);

  .encabezado-tarjeta {
    align-items: center;
  }
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
</style>
