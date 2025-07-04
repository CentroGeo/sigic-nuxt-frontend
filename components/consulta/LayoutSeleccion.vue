<script setup>
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const storeSelected = useSelectedResourcesStore();
</script>

<template>
  <div class="m0">
    <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

    <div class="m-x-2 m-y-1">
      <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

      <div class="flex m-y-3">
        <button
          type="button"
          class="boton-primario"
          aria-label="Descargar mapa"
        >
          Descargar mapa
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
          @click="storeSelected.resetResource(resourceType)"
        >
          <span class="pictograma-eliminar" aria-hidden="true" />
        </button>
      </div>

      <UiNumeroElementos
        :numero="storeSelected.selectedResources[resourceType].length"
        :etiqueta="etiquetaElementos"
      />
    </div>

    <div class="m-x-2 m-y-1">
      <ConsultaElementoSeleccionado
        v-for="resource in storeSelected.selectedResources[resourceType]"
        :key="`seleccion-${resource.uuid}`"
        :selected-element="resource"
        :resource-type="resourceType"
      />
    </div>
  </div>
</template>
