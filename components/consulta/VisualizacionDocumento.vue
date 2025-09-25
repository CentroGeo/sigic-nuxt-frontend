<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { resourceTypeDic } from '~/utils/consulta';

const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyUrl } = useGnoxyUrl();
const resourceType = resourceTypeDic.document;
const embedRef = ref(null);
const selectedUuid = computed(() => storeSelected.lastVisible()?.uuid ?? null);
const selectedElement = computed(() => {
  if (!selectedUuid.value) return null;
  return storeResources.findResources([selectedUuid.value], resourceType)[0] ?? null;
});
let resizeObserver;
const extensionDocumento = computed(() => {
  const linkCargado = selectedElement.value.links.find((link) => link.link_type === 'uploaded');
  if (linkCargado.url) {
    return linkCargado.extension;
  } else return '';
});

const urlEmbebido = ref(
  extensionDocumento.value === 'pdf'
    ? selectedElement.value.embed_url
    : selectedElement.value.embed_url.replace('/embed', '/link')
);
/* const urlEmbebido = ref();
const extensionDocumento = ref();
const blobedUrl = ref();
async function updateValues() {
  const linkCargado = selectedElement.value.links.find((link) => link.link_type === 'uploaded');
  extensionDocumento.value = linkCargado.extension;
  urlEmbebido.value = selectedElement.value.embed_url.replace('/embed', '/link');
  blobedUrl.value = await fetchDoc(urlEmbebido.value);
} */
//updateValues();
watch(selectedElement, (nv) => {
  (async () => {
    // console.log('cambio el uuid');
    if (nv) {
      // limpiar antes de volver a asignar
      urlEmbebido.value = null;
      //blobedUrl.value = null;
      //extensionDocumento.value = null;
      // esperar a que el DOM reaccione
      await nextTick();

      urlEmbebido.value =
        extensionDocumento.value === 'pdf' ? nv.embed_url : nv.embed_url.replace('/embed', '/link');
      console.log(urlEmbebido.value);
      //updateValues();
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
  <div class="contenedor-embed">
    <embed
      v-if="urlEmbebido"
      ref="embedRef"
      :src="gnoxyUrl(urlEmbebido)"
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
