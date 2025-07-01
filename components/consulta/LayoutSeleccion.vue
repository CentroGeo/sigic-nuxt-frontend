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
  <div>
    <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

    <div class="m-x-2 m-y-1">
      <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

      <div class="flex">
        <button>Descargar mapa</button>

        <button>
          <span class="pictograma-compartir" aria-hidden="true" />
        </button>

        <button @click="storeSelected.resetResource(resourceType)">
          <span class="pictograma-eliminar" aria-hidden="true" />
        </button>
      </div>

      <BaseNumeroElementos
        :numero="storeSelected.selectedResources[resourceType].length"
        :etiqueta="etiquetaElementos"
      />
    </div>

    <ul class="lista-sin-dibujo">
      <li
        v-for="resource in storeSelected.selectedResources[resourceType]"
        :key="`seleccion-${resource.uuid}`"
      >
        <button @click="storeSelected.removeResource(resourceType, resource)">
          {{ resource.title }}
        </button>
      </li>
    </ul>
  </div>
</template>
