<script setup>
import { onBeforeUnmount, ref } from 'vue';

const storeFetched = useFetchedResourcesStore();
const storeSelected = useSelectedResources2Store();

const resourceType = 'document';
//const urlEmbebido = ref(null);
const embedRef = ref(null);
const selectedUuid = computed(() => storeSelected.selectedOnes()[0]?.uuid ?? null);
const selectedElement = computed(() => {
  if (!selectedUuid.value) return null;
  return storeFetched.findResources([selectedUuid.value], resourceType)[0] ?? null;
});
let resizeObserver;
const extensionDocumento = computed(() => {
  const linkCargado = selectedElement.value.links.find((link) => link.link_type === 'uploaded');
  if (linkCargado) {
    return linkCargado.extension;
  } else return '';
});
const urlEmbebido = ref(
  extensionDocumento.value === 'pdf'
    ? selectedElement.value.embed_url
    : selectedElement.value.embed_url.replace('/embed', '/link')
);

watch(selectedElement, (nv) => {
  (async () => {
    console.log('cambio el uuid');
    if (nv) {
      urlEmbebido.value = null; // limpiar antes de volver a asignar
      await nextTick(); // esperar a que el DOM reaccione

      urlEmbebido.value =
        extensionDocumento.value === 'pdf' ? nv.embed_url : nv.embed_url.replace('/embed', '/link');

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
  })();
});

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
      :type="extensionDocumento === 'pdf' ? 'application/pdf' : 'text/plain'"
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
