<script setup>
import { fetchByPk } from '~/utils/catalogo';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();
const storeMetadatos = useEditedMetadataStore();
// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
// Recuperamos la información completa del recurso
const editedResource = ref(undefined);
const isLoading = computed(() => storeMetadatos.isLoading);

onMounted(async () => {
  editedResource.value = await fetchByPk(selectedPk);
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource && !isLoading" id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <CatalogoOpcionalesMeta
            :recurso="editedResource"
            :resource-pk="selectedPk"
            :resource-type="type"
            :is-modal="false"
          />
        </div>
      </main>

      <main v-else>
        <div class="flex flex-contenido-centrado m-t-3">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
