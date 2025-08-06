<script setup>
import { onBeforeUnmount, ref } from 'vue';

const resourcesStore = useSelectedResources2Store();
const fetchedStore = useFetchedResourcesStore()
const resourceType = 'document';
//const urlEmbebido = ref(null);
const embedRef = ref(null);
const selected = computed(() => resourcesStore[resourceType].filter((element) => element.isSelected === 1)[0])
const selectedUuid = computed(() => selected.value?.uuid ?? null)
const selectedElement = computed(() => {
  if (!selectedUuid.value) return null;
  return fetchedStore.findResources([selectedUuid.value], resourceType)[0] ?? null;
});
const urlEmbebido = ref(selectedElement.value.embed_url)
let resizeObserver;

watch(selectedElement, (nv) => {
  (async () => {
    console.log('cambio el uuid')
    if (nv) {
      urlEmbebido.value = null; // limpiar antes de volver a asignar
      await nextTick(); // esperar a que el DOM reaccione
      urlEmbebido.value = nv.embed_url;

      await nextTick(); // esperar a que el <embed> esté en DOM

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      resizeObserver = new ResizeObserver(() => {
        resizeObserver.disconnect();
      });

      if (embedRef.value) {
        resizeObserver.observe(embedRef.value);
      }
    } else {
      urlEmbebido.value = null;
    }
  })()
}
);

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <div class="contenedor-embed">
    <embed
      v-if="urlEmbebido"
      ref="embedRef"
      :src="urlEmbebido"
      type="application/pdf"
      class="documento-embebido"
    />
  </div>
</template>

<style scoped>
.contenedor-embed {
  max-height: calc(100vh - 52px);
  height: 100%;
}
.documento-embebido {
  width: 100%;
  height: 100%;
}
</style>
