<script setup>
import { useDownloadResources } from '~/composables/useDownloadResources';
const props = defineProps({
  selectedElementPk: {
    type: String,
    default: null,
  },
});

const { fetchDoc } = useDownloadResources();
const storeResources = useResourcesCatalogoStore();
const emit = defineEmits(['docCargado']);

const documentRef = ref(null);
const resourceByPk = ref(null);
const resourceEmbedURL = ref(null);
const extensionDocumento = ref(null);
const blobedUrl = ref('');

async function updateValues() {
  const linkCargado = resourceByPk.value.links.find((link) => link.link_type === 'uploaded');
  extensionDocumento.value = linkCargado.extension;
  resourceEmbedURL.value = resourceByPk.value.embed_url.replace('/embed', '/link');
  blobedUrl.value = await fetchDoc(resourceEmbedURL.value);
}

onMounted(async () => {
  resourceByPk.value = await storeResources.fetchResourceByPk(props.selectedElementPk);
  updateValues();
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
  height: calc(100vh - 224px);
  .documento-embebido {
    width: 100%;
    height: 100%;
  }
}
</style>
