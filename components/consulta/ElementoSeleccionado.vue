<script setup>
import { useSelectedResourcesStore } from "~/stores/selectedResources.js";
const resourcesStore = useSelectedResourcesStore();

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);
</script>
<template>
  <div class="tarjeta">
    <div class="tarjeta-cuerpo">
      <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
        <p class="tarjeta-texto-secundario m-0">Categoria</p>
        <div class="m-0">
          <span
            class="pictograma-informacion pictograma-mediano"
            aria-hidden="true"
          ></span>
          <span
            class="pictograma-subir-capa pictograma-mediano"
            aria-hidden="true"
          ></span>
          <span
            class="pictograma-bajar-capa pictograma-mediano"
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <div>
        <p class="tarjeta-titulo">
          {{ selectedElement.title }}
        </p>

        <div class="flex flex-contenido-final">
          <button
            class="boton-pictograma"
            aria-label="Remover selección"
            type="button"
            @click="
              resourcesStore.removeResource(resourceType, selectedElement)
            "
          >
            <span class="pictograma-eliminar" aria-hidden="true"></span>
          </button>
          <button
            class="boton-pictograma"
            aria-label="Descargar selección"
            type="button"
          >
            <span
              class="pictograma-archivo-descargar"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tarjeta-cuerpo {
  padding: 16px;
}
.encabezado-tarjeta {
  align-items: center;
}
</style>
