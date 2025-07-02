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
  <div class="tarjeta-seleccionada fondo-color-acento">
    <div class="header-tarjeta">
      <p>Categoria</p>
      <div>
        <span
          class="pictograma-informacion pictograma-chico"
          aria-hidden="true"
        ></span>
        <span
          class="pictograma-subir-capa pictograma-chico"
          aria-hidden="true"
        ></span>
        <span
          class="pictograma-bajar-capa pictograma-chico"
          aria-hidden="true"
        ></span>
      </div>
    </div>

    <div>
      <h3>
        {{ selectedElement.title }}
      </h3>

      <div class="contenedor-botones">
        <button
          class="boton-pictograma"
          aria-label="Remover selección"
          type="button"
          @click="resourcesStore.removeResource(resourceType, selectedElement)"
        >
          <span class="pictograma-eliminar" aria-hidden="true"></span>
        </button>
        <button
          class="boton-pictograma"
          aria-label="Descargar selección"
          type="button"
        >
          <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tarjeta-seleccionada {
  margin: 15px 10px;
  h3 {
    margin: 4px;
  }
}
.header-tarjeta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  p {
    margin: 0px;
  }
  span {
    margin: 0px;
  }
}

.contenedor-botones {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
