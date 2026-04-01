<script setup>
import { useDownloadResources } from '~/composables/useDownloadResources';
const props = defineProps({
  selectedElementPk: {
    type: Number,
    default: null,
  },
});

const { selectedElementPk } = toRefs(props);
const storeResources = useResourcesIAStore();
const { fetchDoc } = useDownloadResources();
const emit = defineEmits(['docCargado']);

const blobedUrl = ref('');
const extensionDocumento = ref();
const resourceByPk = ref();
const linkCargado = ref();
const resourceEmbedURL = ref();

async function cargarPDF(pk) {
  blobedUrl.value = '';
  resourceByPk.value = {};
  linkCargado.value = {};
  extensionDocumento.value = '';
  resourceEmbedURL.value = '';
  blobedUrl.value = '';
  //
  resourceByPk.value = await storeResources.fetchResourceByPk(pk);
  linkCargado.value = resourceByPk.value?.links.find((link) => link.link_type === 'uploaded');
  extensionDocumento.value = linkCargado.value?.extension;
  resourceEmbedURL.value = resourceByPk.value?.embed_url.replace('/embed', '/link');
  blobedUrl.value = await fetchDoc(resourceEmbedURL.value);
}
await cargarPDF(selectedElementPk.value);

watch(selectedElementPk, async (nv) => {
  await cargarPDF(nv);
});
</script>

<template>
  <div v-if="blobedUrl !== ''" class="contenedor-doc-embed">
    <embed
      ref="documentRef"
      class="documento-embebido"
      :src="blobedUrl"
      :type="extensionDocumento === 'pdf' ? 'application/pdf' : 'text/plain'"
      :onload="emit('docCargado')"
    />
  </div>
</template>

<style lang="scss" scoped>
.contenedor-doc-embed {
  height: calc(100vh - 112px);
  .documento-embebido {
    width: 100%;
    height: 100%;
  }
}
</style>
