<script setup>
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
  funcionDescarga: { type: Function, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const selectedStore = useSelectedResourcesStore();
const buttonTagDict = {
  dataLayer: "mapa",
  dataTable: "archivo",
  document: "archivo",
};
</script>

<template>
  <div class="m0 seleccion-layout">
    <div class="controles-seleccion">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <div class="flex m-y-3">
          <button
            type="button"
            class="boton-primario"
            aria-label="Descargar mapa"
            @click="funcionDescarga"
          >
            Descargar {{ buttonTagDict[resourceType] }}
            <span class="pictograma-mapa-generador" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Compartir"
          >
            <span class="pictograma-compartir" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Eliminar"
            @click="selectedStore.resetResource(resourceType)"
          >
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </div>

        <UiNumeroElementos
          :numero="selectedStore.selectedResources[resourceType].length"
          :etiqueta="etiquetaElementos"
        />
      </div>
    </div>

    <div class="m-x-2 m-y-1">
      <ConsultaElementoSeleccionado
        v-for="resource in selectedStore.selectedResources[resourceType]"
        :key="`seleccion-${resource.uuid}`"
        :selected-element="resource"
        :resource-type="resourceType"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.seleccion-layout {
  height: 100vh;
  overflow-y: auto;
}
.controles-seleccion {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--color-neutro-0);
  padding-bottom: 8px;
}
</style>
