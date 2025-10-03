<script>
export const lados = {
  derecha: 'derecho',
  izquierda: 'izquierdo',
};
</script>

<script setup>
defineProps({
  lado: {
    type: String,
    default: lados.derecha,
  },
});

const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();

const open = ref(false);
</script>

<template>
  <div class="colapsable" :class="{ abierto: open }">
    <button
      class="colapsable-boton"
      :aria-controls="`colapsable-division-${lado}`"
      :aria-expanded="open"
      type="button"
      @click="open = !open"
    >
      Panel {{ lado }}
      <span :aria-hidden="true" class="pictograma-angulo-derecho" />
    </button>

    <div :id="`colapsable-division-${lado}`" class="colapsable-contenedor" :aria-hidden="!open">
      <ol>
        <li v-for="capa in storeResources.findResources(storeSelected.pks)" :key="`${capa}`">
          <input :id="`control-${lado}-${capa}`" type="checkbox" />
          <label :for="`control-${lado}-${capa}`">
            {{ capa.title }}
          </label>
        </li>
      </ol>
    </div>
  </div>
</template>
