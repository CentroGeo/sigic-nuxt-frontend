<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { fetchHarvesters } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();
const harvesters = ref([]);
const fetchStatus = ref(null);
const queryParams = ref({ page_size: 10 });
const isLoading = ref(true);
const seleccionOrden = ref(null);
const inputSearch = ref(null);

async function getResources() {
  isLoading.value = true;
  const { status, data } = await fetchHarvesters(false, queryParams.value);
  harvesters.value = data;
  fetchStatus.value = status;
  isLoading.value = false;
}
getResources();
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
          <UiNumeroElementos :numero="harvesters.length" />
        </div>
        <p>
          Explora los recursos de información de catálogos precargados, al importarlos podrás
          agregarlos a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás
          completar previamente los metadatos.
        </p>

        <!--El spinner general-->
        <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <!--Las tarjetas de servicios remotos-->
        <div v-if="!isLoading && fetchStatus === 'ok'" class="flex">
          <CatalogoTarjetaServicio
            v-for="catalogo in harvesters"
            :key="catalogo.id"
            :harvester="catalogo"
          />
        </div>

        <!--Mensaje de error si falla la petición-->
        <div
          v-if="!isLoading && fetchStatus === 'error'"
          class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
        >
          <span class="pictograma-alerta" />
          <b>
            No se pudo completar la solicitud. Revisa tu conexión e intentalo de nuevo más tarde.</b
          >
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
