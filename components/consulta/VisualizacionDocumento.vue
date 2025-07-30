<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";

const resourcesStore = useSelectedResourcesStore();
const resourceType = "document";

const urlEmbebido = ref(null);
const embedRef = ref(null);

// Esto es por si ya había un documento seleccionado
if (resourcesStore.shownFiles[resourceType]) {
  urlEmbebido.value = resourcesStore.shownFiles[resourceType]["embed_url"];
}

let resizeObserver;

// Observa cambios en el recurso seleccionado
watch(
  () => resourcesStore.shownFiles[resourceType],
  async (nv) => {
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
    >
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
