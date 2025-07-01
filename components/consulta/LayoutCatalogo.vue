<script setup>
const props = defineProps({
  resourcesList: {
    type: Array,
    default: () => [],
  },
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});
const { resourcesList, titulo, resourceType } = toRefs(props);

const storeSelected = useSelectedResourcesStore();
</script>

<template>
  <div>
    <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

    <div class="m-x-2 m-y-1">
      <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

      <p>Buscador</p>

      <BaseNumeroElementos
        :numero="resourcesList.length"
        :etiqueta="etiquetaElementos"
      />
    </div>

    <ul class="lista-sin-dibujo">
      <li
        v-for="resource in resourcesList"
        :key="`disponible-${resource.uuid}`"
      >
        <button @click="storeSelected.addResource(resourceType, resource)">
          {{ resource.title }}
        </button>
      </li>
    </ul>
  </div>
</template>
