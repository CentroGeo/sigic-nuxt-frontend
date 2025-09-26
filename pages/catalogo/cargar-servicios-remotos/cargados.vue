<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeFilters = useFilteredResources();
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const recursos = computed(() => storeFetched.all);
const filteredRemoteResources = ref([]);

function updateResources(nuevosRecursos) {
  filteredRemoteResources.value = nuevosRecursos;
  filteredRemoteResources.value = filteredRemoteResources.value.filter(
    (resource) => resource.sourcetype === 'REMOTE'
  );
  console.warn('filteredRemoteResources', filteredRemoteResources.value);
}

watch([recursos], () => {
  updateResources(storeFilters.filter('all'));
});

onMounted(() => {
  storeFilters.resetAll();
  if (recursos.value.length !== 0) {
    updateResources(recursos.value);
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <h2>Carga catálogos externos</h2>

        <div class="ancho-fijo">
          <h3>Recursos cargados</h3>
          <form>
            <table>
              <thead>
                <tr>
                  <th>Nombre de servicio externo</th>
                  <th>Recursos exportados</th>
                  <th>Recursos pendientes</th>
                  <th>URL</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="value in filteredRemoteResources" :key="value.pk">
                  <td>{{ value.title }}</td>
                  <td><a href="#">''</a></td>
                  <td><a href="#">''</a></td>
                  <td>https://</td>
                  <!-- <td>ArcGIS REST MapServer</td> -->
                  <td>Servcio de Mapas</td>
                </tr>
              </tbody>
            </table>
            <div class="flex flex-contenido-inicio m-t-3">
              <nuxt-link
                class="boton boton-primario"
                aria-label="Ir a catálogo externo en mis archivos"
                to="/catalogo/mis-archivos"
                >Ver catálogo Externo en Mis Archivos</nuxt-link
              >
              <nuxt-link
                class="boton boton-secundario"
                aria-label="Agregar servicio remoto"
                to="/catalogo/cargar-servicios-remotos"
                >Agregar servicio remoto</nuxt-link
              >
            </div>
          </form>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
