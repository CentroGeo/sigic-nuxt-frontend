<script setup>
// import { fetchDoc } from '~/utils/consulta';
const props = defineProps({
  selectedElementPk: {
    type: String,
    default: null,
  },
});
const storeResources = useResourcesIAStore();
// const emit = defineEmits(['docCargado']);

// const blobedUrl = ref('');
// const extensionDocumento = ref();

const resourceByPk = ref();
resourceByPk.value = await storeResources.fetchResourceByPk(props.selectedElementPk);

// const linkCargado = resourceByPk.value?.links.find((link) => link.link_type === 'uploaded');
// extensionDocumento.value = linkCargado?.extension;
// const resourceEmbedURL = resourceByPk.value?.embed_url.replace('/embed', '/link');
// blobedUrl.value = await fetchDoc(resourceEmbedURL);
const paginaActual = ref(0);
const tamanioPagina = 6;
const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: resourceByPk.value,
});

watch([paginaActual], () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: resourceByPk.value,
  });
});
</script>

<template>
  <div>
    <div v-if="Math.ceil(totalFeatures / tamanioPagina) < 1" class="flex flex-contenido-centrado">
      <figure>
        <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
        <figcaption class="texto-centrado">Cargando tabla</figcaption>
      </figure>
    </div>
    <div v-else class="contenedor-tabla">
      <UiPaginador
        :pagina-parent="paginaActual"
        :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
        @cambio="paginaActual = $event"
      />
      <UiTablaAccesible :variables="variables" :datos="datos" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
