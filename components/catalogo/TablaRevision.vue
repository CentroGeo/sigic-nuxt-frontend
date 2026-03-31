<script setup>
const props = defineProps({
  selectedElementPk: {
    type: String,
    default: null,
  },
});
const storeResources = useResourcesIAStore();

const resourceByPk = ref();
resourceByPk.value = await storeResources.fetchResourceByPk(props.selectedElementPk);

const revisionMetadatos = ref(null);
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
        <img
          class="color-invertir"
          :src="`${$config.app.baseURL}img/loader.gif`"
          alt="Loader de SIGIC"
        />
        <figcaption class="texto-centrado">Cargando tabla</figcaption>
      </figure>
    </div>
    <div v-else>
      <div class="columna-16">
        <div class="m-y-4 flex flex-contenido-separado">
          <h2 class="m-0">{{ resourceByPk.title }}</h2>
          <button class="boton-secundario p-1" @click="revisionMetadatos?.abrirModalRevision">
            Ver metadatos
          </button>
        </div>
      </div>

      <div class="contenedor-tabla">
        <UiPaginador
          :pagina-parent="paginaActual"
          :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
        <UiTablaAccesible :variables="variables" :datos="datos" />
      </div>

      <CatalogoModalRevisionMeta
        ref="revisionMetadatos"
        :review-pk="props.selectedElementPk"
        :resource-type="'datasets'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
