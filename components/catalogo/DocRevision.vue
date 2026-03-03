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
const revisionMetadatos = ref(null);
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
    <div class="m-y-4 flex flex-contenido-separado">
      <h2 class="m-0">{{ resourceByPk.title }}</h2>
      <button class="boton-secundario p-1" @click="revisionMetadatos?.abrirModalRevision">
        Ver metadatos
      </button>
    </div>

    <embed
      ref="documentRef"
      class="documento-embebido"
      :src="blobedUrl"
      :type="extensionDocumento === 'pdf' ? 'application/pdf' : 'text/plain'"
      :onload="emit('docCargado')"
    />

    <CatalogoModalRevisionMeta
      ref="revisionMetadatos"
      :review-pk="selectedElementPk"
      :resource-type="'documents'"
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
