<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { fetchHarvesters } from '~/utils/catalogo';
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const harvesters = ref([]);
const isLoadingGeneral = ref(true);
const isLoadingPage = ref(true);
const fetchStatus = ref(null);

const seleccionOrden = ref('-id');
const inputSearch = ref(null);
const paginaActual = ref(0);
const tamanioPagina = 5;
const totalHarvesters = ref();
const totalPags = computed(() => Math.ceil(totalHarvesters.value / tamanioPagina));
const queryParams = ref({
  page: paginaActual.value + 1,
  page_size: tamanioPagina,
  'sort[]': seleccionOrden.value,
});

const statusDict = {
  ready: 'Listo',
  'updating-harvestable-resources': 'Listando recursos',
  'harvesting-resources': 'Cosechando recursos',
};
/**
 * Esta petición obtiene el total de servicios externos
 */
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

/**
 * Solicita información de los servicios externos enviando queryparams.
 * Esta función es reutilizable
 */
async function fetchResources() {
  isLoadingPage.value = true;
  const { status, data } = await fetchHarvesters(true, queryParams.value);
  harvesters.value = data;
  fetchStatus.value = status;
  isLoadingPage.value = false;
}

/**
 * Solicita información de los servicios externos enviando queryparams
 * la primera vez que se abre la página.
 * Esta función coordina el estado global del componente.
 */
async function getResources() {
  isLoadingGeneral.value = true;
  totalHarvesters.value = await getTotal();
  await fetchResources();
  isLoadingGeneral.value = false;
}

/**
 *
 * @param v
 * @param destino
 */
const irARutaQuery = (v, destino) => {
  if (destino !== 'pendientes') {
    navigateTo({
      path: `/catalogo/servicios-remotos/${v.id}`,
      query: {
        id: v.id,
        title: v.title,
        total: v.imported_resources + v.to_attend_resources,
        /*         unique_identifier: v.unique_identifier,
        remote_resource_type: v.remote_resource_type, */
      },
    });
  } else {
    navigateTo({
      path: `/catalogo/servicios-remotos/importar`,
      query: {
        id: v.id,
        title: v.title,
        /*         unique_identifier: v.unique_identifier,
        remote_resource_type: v.remote_resource_type, */
      },
    });
  }
};

watch(paginaActual, () => {
  queryParams.value.page = paginaActual.value + 1;
  fetchResources();
});

watch(seleccionOrden, () => {
  queryParams.value['sort[]'] = seleccionOrden.value;
  if (paginaActual.value === 0) {
    fetchResources();
  } else {
    paginaActual.value = 0;
  }
});

onMounted(() => {
  getResources();
});
</script>
<template>
  <main>
    <div id="servicios-institucionales">
      <h3>Explora catálogos externos preconectados</h3>
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
      <p>
        Explora los recursos de información de catálogos precargados, al importarlos podrás
        agregarlos a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás
        completar previamente los metadatos de cada uno.
      </p>
    </div>

    <!--El spinner general-->
    <div v-if="isLoadingGeneral" class="flex flex-contenido-centrado m-y-5">
      <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
    </div>

    <!--Si aun no hay servicios catgados por usuarios-->
    <div
      v-if="!isLoadingGeneral && fetchStatus === 'ok' && harvesters.length === 0"
      class="flex flex-contenido-centrado"
    >
      <div class="texto-color-error borde-redondeado-8 sin-recursos" style="max-width: 50%">
        <h5>Aún no hay servicios remotos registrados.</h5>
        <p>Registra un servicio remoto, edita sus metadatos y visualiza sus recursos.</p>
      </div>
      <div class="columna-16 flex flex-contenido-centrado">
        <NuxtLink
          class="boton boton-primario boton-chico m-y-2"
          to="/catalogo/servicios-remotos/agregar"
          >Agregar servicio remoto</NuxtLink
        >
      </div>
    </div>

    <!--La tabla de servicios remotos-->
    <div
      v-if="!isLoadingGeneral && fetchStatus === 'ok' && harvesters.length > 0"
      class="contenedor m-b-10"
    >
      <table>
        <thead>
          <tr>
            <th>Nombre de servicio externo</th>
            <th>Recursos importados</th>
            <th>Recursos pendientes</th>
            <th>URL</th>
            <!--<th>Tipo</th>-->
            <th>Status</th>
          </tr>
        </thead>
        <tbody v-if="!isLoadingPage">
          <tr v-for="harvester in harvesters" :key="harvester.id">
            <td>{{ harvester.title }}</td>
            <td>
              <nuxt-link v-if="harvester.status === 'ready'" @click="irARutaQuery(harvester, '')">
                {{ harvester.imported_resources }}
              </nuxt-link>
              <p v-else>{{ harvester.imported_resources }}</p>
            </td>

            <td>
              <nuxt-link
                v-if="harvester.status === 'ready'"
                @click="irARutaQuery(harvester, 'pendientes')"
              >
                {{ harvester.to_attend_resources }}
              </nuxt-link>
              <p v-else>{{ harvester.to_attend_resources }}</p>
            </td>
            <td>
              <a :href="harvester.remote_url" target="_blank" rel="noopener noreferrer">
                {{ harvester.remote_url }}
              </a>
            </td>
            <!--<td>Servcio de Mapas</td>-->
            <td>
              <div
                v-if="harvester.status === 'ready'"
                class="texto-color-confirmacion texto-centrado fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
              >
                {{ statusDict[harvester.status] }}
              </div>
              <div
                v-else
                class="texto-color-informacion texto-centrado fondo-color-informacion borde borde-color-informacion borde-redondeado-8 p-1"
              >
                {{ statusDict[harvester.status] }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isLoadingPage" class="flex flex-contenido-centrado m-y-2">
        <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="32px" />
      </div>
      <UiPaginador
        :pagina-parent="paginaActual"
        :total-paginas="totalPags"
        @cambio="paginaActual = $event"
      />
    </div>

    <!--Mensaje de error si falla la petición-->
    <div
      v-if="!isLoadingGeneral && fetchStatus === 'error'"
      class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
    >
      <span class="pictograma-alerta" />
      <b> No se pudo completar la solicitud. Revisa tu conexión e intentalo de nuevo más tarde.</b>
    </div>
  </main>
</template>
<style scoped>
.sin-recursos {
  background-color: var(--fondo-acento);
  gap: 8px;
  padding: 16px;
}
</style>
