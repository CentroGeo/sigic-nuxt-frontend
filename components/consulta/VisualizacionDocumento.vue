<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { fetchDoc, resourceTypeDic } from '~/utils/consulta';

const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const resourceType = resourceTypeDic.document;
const embedRef = ref(null);
const selectedPk = computed(() => storeSelected.lastVisible()?.pk ?? null);
const selectedElement = computed(() => {
  if (!selectedPk.value) return null;
  return storeResources.findResources([selectedPk.value], resourceType)[0] ?? null;
});
let resizeObserver;

const urlEmbebido = ref();
const extensionDocumento = ref();
const blobedUrl = ref();
async function updateValues() {
  const linkCargado = selectedElement.value.links.find((link) => link.link_type === 'uploaded');
  extensionDocumento.value = linkCargado.extension;
  urlEmbebido.value = selectedElement.value.embed_url.replace('/embed', '/link');
  blobedUrl.value = await fetchDoc(urlEmbebido.value);
}
if (selectedElement.value !== null) {
  updateValues();
}
watch(selectedElement, (nv) => {
  (async () => {
    if (nv) {
      // limpiar antes de volver a asignar
      urlEmbebido.value = null;
      blobedUrl.value = null;
      extensionDocumento.value = null;

      //esperar a que el DOM reaccione
      await nextTick();
      updateValues();

      // esperar a que el <embed> esté en DOM
      await nextTick();

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
  <div class="contenedor-embed fondo-color-neutro">
    <iframe
      v-if="urlEmbebido"
      ref="embedRef"
      :src="blobedUrl"
      :type="extensionDocumento === 'pdf' ? 'application/pdf' : 'text/plain'"
      class="documento-embebido"
    />
  </div>
</template>

<style scoped>
.contenedor-embed {
  max-height: calc(100vh - 112px);
  height: 100%;
}
.documento-embebido {
  width: 100%;
  height: 100%;
}
</style>
