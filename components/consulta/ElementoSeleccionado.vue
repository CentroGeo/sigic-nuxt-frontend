<script setup>
import { categoriesInSpanish, resourceTypeDic, tooltipContent } from '~/utils/consulta';

const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const emit = defineEmits(['openOpacity', 'openDownload', 'openTabla', 'openMapa', 'openOWS']);
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => {},
  },
  resourceType: { type: String, required: true },
});

const resourceElement = computed(() => storeResources.findResource(props.selectedElement.pk));
const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
//const userEmail = ref(data.value?.user.email);
const goDown = () => storeSelected.changePosition(props.selectedElement.pk, -1);
const goUp = () => storeSelected.changePosition(props.selectedElement.pk, +1);

const isElementReady = ref(false);
</script>

<template>
  <div class="tarjeta m-y-1">
    <div class="tarjeta-selected fondo-color-acento">
      <div
        v-if="resourceElement && isElementReady"
        class="flex flex-contenido-separado m-0 encabezado-tarjeta"
      >
        <p v-if="resourceElement" class="tarjeta-texto-secundario m-0">
          {{
            resourceElement?.category
              ? categoriesInSpanish[resourceElement?.category.gn_description]
              : 'Sin Clasificar'
          }}
        </p>

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
            :disabled="storeSelected.pks.length === selectedElement.posicion + 1"
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
      <div v-if="resourceElement && isElementReady">
        <div
          v-if="
            isLoggedIn &&
            resourceElement.is_approved === false &&
            resourceElement.is_published === false
          "
          class="id-tag flex m-b-1 m-t-0"
        >
          <span class="pictograma-persona"></span>
          Mis archivos
        </div>
        <div v-if="resourceElement.sourcetype === 'REMOTE'" class="id-tag flex m-b-1 m-t-0">
          <span class="pictograma-colaborar"></span>
          Catálogo externo
        </div>
      </div>

      <ConsultaContenidoCapaSeleccionada
        v-if="props.resourceType === resourceTypeDic.dataLayer"
        :resource-element="resourceElement"
        @opacidad-clicked="emit('openOpacity', resourceElement)"
        @descarga-clicked="emit('openDownload', resourceElement)"
        @tabla-clicked="emit('openTabla', resourceElement)"
        @ows-clicked="(link) => emit('openOWS', link)"
        @resource-ready="isElementReady = true"
      />

      <ConsultaContenidoDocSeleccionado
        v-else
        :group-name="props.resourceType"
        :resource-type="props.resourceType"
        :resource-element="resourceElement"
        @descarga-clicked="emit('openDownload', resourceElement)"
        @mapa-clicked="emit('openMapa', resourceElement)"
        @resource-ready="isElementReady = true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tarjeta-selected {
  padding: 16px;
  // background-color: var(--color-secundario-2);
  color: var(--campo-etiqueta-color);

  .encabezado-tarjeta {
    align-items: center;
  }
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
.id-tag {
  background-color: var(--fondo-acento);
  padding: 8px;
  border: solid 1px;
  border-radius: 8px;
  color: var(--campo-etiqueta-color);
  width: fit-content;
  align-items: left;
  gap: 8px;
}
</style>
