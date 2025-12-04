<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const storeCatalogo = useCatalogoStore();
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const institutionalHarvesters = ref([]);
const isLoading = ref(true);
const seleccionOrden = ref(null);
const inputSearch = ref(null);

async function fetchHarvesters() {
  isLoading.value = true;
  let harvesters = [];
  let endpoint = `${config.public.geonodeApi}/harvesters/`;

  // Obtenemos la información de todos los harvesters
  do {
    const requestHarvesters = await gnoxyFetch(endpoint);
    if (!requestHarvesters.ok) {
      const error = await requestHarvesters.json();
      console.error('Falló petición de harvesters:', error);
    }
    const resHarvesters = await requestHarvesters.json();

    endpoint = resHarvesters.links.next;
    harvesters = [...harvesters, ...resHarvesters.harvesters];
  } while (endpoint);

  // A partir de la información de los harvesters, construimos un nuevo objeto para construir las tarjetas
  harvesters.forEach(async (h) => {
    const harvestableResourcesUrl = h.links.harvestable_resources;
    const resA = await gnoxyFetch(`${harvestableResourcesUrl}/?page_size=1`);
    const dataA = await resA.json();
    const totalResources = dataA.total;
    institutionalHarvesters.value.push({
      id: h.id,
      title: h.name,
      total_resources: totalResources,
      remote_url: h.remote_url,
    });
  });
  isLoading.value = false;
}
fetchHarvesters();
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div class="flex">
          <!-- Selector Orden -->
          <div class="columna-8">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_descendente">Más Reciente</option>
                <option value="fecha_ascendente">Más Antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <!-- Campo de búsqueda avanzada -->
          <div class="columna-8">
            <div class="flex flex-contenido-separado">
              <div class="columna-14">
                <ClientOnly>
                  <label for="idunicobusqueda"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusqueda"
                      v-model="inputSearch"
                      type="search"
                      class="campo-busqueda-entrada"
                      placeholder="Campo de búsqueda"
                    />

                    <button
                      style="margin: 0; margin-right: 4px"
                      class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                      aria-label="Borrar"
                      type="button"
                    >
                      <span aria-hidden="true" class="pictograma-cerrar" />
                    </button>

                    <button
                      class="boton-primario boton-pictograma campo-busqueda-buscar"
                      aria-label="Buscar"
                      type="button"
                    >
                      <span class="pictograma-buscar" aria-hidden="true" />
                    </button>
                  </form>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
        <div class="flex m-t-2">
          <h2>Catalogos externos</h2>
          <UiNumeroElementos :numero="institutionalHarvesters.length" />
        </div>
        <p>
          Explora los recursos de información de catálogos precargados, al importarlos podrás
          agregarlos a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás
          completar previamente los metadatos.
        </p>
        <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>
        <div v-else class="flex">
          <CatalogoTarjetaServicio
            v-for="catalogo in institutionalHarvesters"
            :key="catalogo.id"
            :harvester="catalogo"
          />
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
