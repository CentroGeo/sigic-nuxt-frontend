<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { fetchHarvesters } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
//const isLoadingPage = ref(false);
const seleccionOrden = ref('-id');
const inputSearch = ref(null);
const tamanioPagina = 3;
const paginaActual = ref(0);
const queryParams = ref({
  page: paginaActual.value + 1,
  page_size: tamanioPagina,
  'sort[]': seleccionOrden.value,
});
const totalHarvesters = ref();
const harvesters = ref([]);
const fetchStatus = ref(null);
const isLoadingGlobal = ref(true);
const isLoadingPage = ref(false);

// Para triggerear la función de observar
let serviceObserver;
const rootServices = ref();

async function getTotal() {
  const url = `${config.public.geonodeApi}/harvesters/`;
  const requestHarvesters = await gnoxyFetch(url);
  if (!requestHarvesters.ok) {
    const error = await requestHarvesters.json();
    console.error('Falló petición de harvesters:', error);
  }
  const resHarvesters = await requestHarvesters.json();
  return resHarvesters.total;
}

async function getResources() {
  isLoadingGlobal.value = true;
  const { status, data } = await fetchHarvesters(true, queryParams.value);
  harvesters.value = [...harvesters.value, ...data];
  fetchStatus.value = status;
  isLoadingGlobal.value = false;
}

async function fetchNewResources() {
  if (harvesters.value.length < totalHarvesters.value) {
    isLoadingPage.value = true;
    paginaActual.value += 1;
    queryParams.value.page = paginaActual.value + 1;
    const { status, data } = await fetchHarvesters(true, queryParams.value);
    harvesters.value = [...harvesters.value, ...data];
    fetchStatus.value = status;
    isLoadingPage.value = false;
  }
}

watch(seleccionOrden, () => {
  paginaActual.value = 0;
  queryParams.value.page = paginaActual.value + 1;
  queryParams.value['sort[]'] = seleccionOrden.value;
  harvesters.value = [];
  getResources();
});

onMounted(async () => {
  // Esto es para observar cuando la tarjeta entra en la vista
  serviceObserver = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        fetchNewResources();
        //serviceObserver.unobserve(entry.target);
      }
    }
  });
  totalHarvesters.value = await getTotal();
  getResources();
});

watch(rootServices, (newValue) => {
  if (newValue) {
    serviceObserver.observe(newValue);
  }
});

onUnmounted(() => {
  if (serviceObserver && rootServices.value) {
    serviceObserver.unobserve(rootServices.value);
  }
});
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
                <option value="id">Más Antiguo</option>
                <option value="-id">Más Reciente</option>
                <option value="name">Nombre</option>
                <option value="status">Status</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <!-- Campo de búsqueda avanzada -->
          <div class="columna-8" style="opacity: 0.5">
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
          <UiNumeroElementos :numero="totalHarvesters" />
        </div>
        <p>
          Explora los recursos de información de catálogos precargados, al importarlos podrás
          agregarlos a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás
          completar previamente los metadatos.
        </p>

        <!--El spinner general-->
        <div v-if="isLoadingGlobal" class="flex flex-contenido-centrado m-y-5">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <!--Las tarjetas de servicios remotos-->
        <div v-if="!isLoadingGlobal && fetchStatus === 'ok'" class="flex">
          <CatalogoTarjetaServicio
            v-for="catalogo in harvesters"
            :key="catalogo.id"
            :harvester="catalogo"
          />
          <div ref="rootServices"></div>
          <div v-if="isLoadingPage" class="columna-16 flex flex-contenido-centrado m-y-2">
            <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="40px" />
          </div>
        </div>

        <!--Mensaje de error si falla la petición-->
        <div
          v-if="!isLoadingGlobal && fetchStatus === 'error'"
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
