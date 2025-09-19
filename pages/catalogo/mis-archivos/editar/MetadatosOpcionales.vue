<script setup>
import { fetchByPk } from '~/utils/catalogo';
// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
// Recuperamos la información completa del recurso
const editedResource = ref(undefined);
onMounted(async () => {
  editedResource.value = await fetchByPk(selectedPk);
});
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource" id="principal" class="contenedor m-b-10 m-y-3">
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
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
