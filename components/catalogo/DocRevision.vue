<script setup>
import { fetchDoc } from '~/utils/consulta';
const props = defineProps({
  selectedElementPk: {
    type: String,
    default: null,
  },
});
const storeResources = useResourcesIAStore();
const emit = defineEmits(['docCargado']);

const blobedUrl = ref('');
const extensionDocumento = ref();

const resourceByPk = ref();
resourceByPk.value = await storeResources.fetchResourceByPk(props.selectedElementPk);

const linkCargado = resourceByPk.value?.links.find((link) => link.link_type === 'uploaded');
extensionDocumento.value = linkCargado?.extension;
const resourceEmbedURL = resourceByPk.value?.embed_url.replace('/embed', '/link');
blobedUrl.value = await fetchDoc(resourceEmbedURL);
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
  height: calc(100vh - 224px);
  .documento-embebido {
    width: 100%;
    height: 100%;
  }
}
</style>
