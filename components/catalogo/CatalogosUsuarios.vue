<script setup>
import { useResourcesSupplements } from '~/composables/useResourcesSupplements';
const { gnoxyFetch } = useGnoxyUrl();
const { fetchRemoteServices } = useResourcesSupplements();

const config = useRuntimeConfig();
const userID = ref(null);
const harvesters = ref([]);
const isLoadingGeneral = ref(true);
const isLoadingPage = ref(true);
const fetchStatus = ref(null);

const seleccionOrden = ref('-created');
const inputSearch = ref(null);
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalHarvesters = ref();
const totalPags = computed(() => Math.ceil(totalHarvesters.value / tamanioPagina));
const queryParams = ref({
  page: paginaActual.value + 1,
  page_size: tamanioPagina,
  sort: seleccionOrden.value,
  title: inputSearch.value,
});

const statusDict = {
  ready: 'Listo',
  'updating-harvestable-resources': 'Listando recursos',
  'harvesting-resources': 'Cosechando recursos',
};
/**
 * Esta función obtiene el pk de la persona usuaria
 */
async function getUserInfo() {
  const { data } = useAuth();
  const email = data.value?.user.email;
  const url = `https://geonode.dev.geoint.mx/api/v2/users/?filter{username}=${email}`;
  const request = await gnoxyFetch(url);
  if (!request.ok) {
    console.error('No se pudo recuperar la información de usuario');
  } else {
    const res = await request.json();
    userID.value = res.users[0]['pk'];
    queryParams.value['owner_id'] = userID.value;
  }
}
/**
 * Esta petición obtiene el total de servicios externos
 */
async function getTotal() {
  let url;
  if (inputSearch.value) {
    url = `${config.public.geonodeApi}/services/?title=${inputSearch.value.trim()}`;
  } else {
    url = `${config.public.geonodeApi}/services/`;
  }
  const requestServices = await gnoxyFetch(url);
  if (!requestServices.ok) {
    const error = await requestServices.json();
    console.error('Falló petición de servicios:', error);
  }
  const resServices = await requestServices.json();
  return resServices.count;
}

/**
 * Solicita información de los servicios externos enviando queryparams.
 * Esta función es reutilizable
 */
async function fetchResources() {
  isLoadingPage.value = true;
  totalHarvesters.value = await getTotal();
  const { status, data } = await fetchRemoteServices(queryParams.value);
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
 * Hace la petición de los servicios externos mandando
 * el input de busqueda como query param
 */
async function searchByName() {
  queryParams.value['title'] = inputSearch.value;
  if (paginaActual.value === 0) {
    fetchResources();
  } else {
    paginaActual.value = 0;
  }
}

/**
 * Limpia el input de busqueda y vuelve a pedir los servicios
 */
async function resetSearch() {
  inputSearch.value = null;
  searchByName();
}

/**
 * Redirige
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
      },
    });
  } else {
    navigateTo({
      path: `/catalogo/servicios-remotos/importar`,
      query: {
        id: v.id,
        title: v.title,
      },
    });
  }
};

watch(paginaActual, () => {
  queryParams.value.page = paginaActual.value + 1;
  fetchResources();
});

watch(seleccionOrden, () => {
  queryParams.value['sort'] = seleccionOrden.value;
  if (paginaActual.value === 0) {
    fetchResources();
  } else {
    paginaActual.value = 0;
  }
});

onMounted(async () => {
  isLoadingGeneral.value = true;
  await getUserInfo();
  await getResources();
});
</script>
<template>
  <main>
    <div id="servicios-institucionales">
      <div class="flex m-t-3 m-b-2">
        <!-- Selector Orden -->
        <div class="columna-8">
          <label for="selector-orden-remotos">Ordenar por</label>
          <select
            v-model="seleccionOrden"
            name="selector-orden-remotos"
            class="m-b-2"
            :disabled="isLoadingPage || isLoadingGeneral"
          >
            <option value="created">Más Antiguo</option>
            <option value="-created">Más Reciente</option>
            <option value="title">Nombre</option>
          </select>
          <ClientOnly> </ClientOnly>
        </div>
        <!-- Campo de búsqueda -->
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
                    :disabled="isLoadingPage || isLoadingGeneral"
                    @keyup.enter="searchByName"
                  />

                  <button
                    style="margin: 0; margin-right: 4px"
                    class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                    aria-label="Borrar"
                    type="button"
                    :disabled="isLoadingPage || isLoadingGeneral"
                    @click="resetSearch"
                  >
                    <span aria-hidden="true" class="pictograma-cerrar" />
                  </button>

                  <button
                    class="boton-primario boton-pictograma campo-busqueda-buscar"
                    aria-label="Buscar"
                    type="button"
                    :disabled="isLoadingPage || isLoadingGeneral"
                    @click="searchByName"
                  >
                    <span class="pictograma-buscar" aria-hidden="true" />
                  </button>
                </form>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
      <div class="flex">
        <!--         <h3>Explora catálogos externos preconectados</h3> -->
        <h2>Servicios Remotos</h2>
        <UiNumeroElementos :numero="totalHarvesters" />
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
      v-if="!isLoadingGeneral && !isLoadingPage && fetchStatus === 'ok' && harvesters.length === 0"
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

    <div
      v-if="!isLoadingGeneral && isLoadingPage && harvesters.length === 0"
      class="flex flex-contenido-centrado m-y-5"
    >
      <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
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
            <!--<th>Tipo</th>-->
            <th>Status</th>
            <th>Recursos importados</th>
            <th>Recursos pendientes</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody v-if="!isLoadingPage">
          <tr v-for="harvester in harvesters" :key="harvester.id">
            <td>{{ harvester.title }}</td>
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
                class="texto-color-alerta texto-centrado fondo-color-alerta borde borde-color-alerta borde-redondeado-8 p-1"
              >
                {{ statusDict[harvester.status] }}
              </div>
            </td>
            <td>
              <nuxt-link @click="irARutaQuery(harvester, '')">
                {{ harvester.imported_resources }}
              </nuxt-link>
            </td>

            <td>
              <nuxt-link @click="irARutaQuery(harvester, 'pendientes')">
                {{ harvester.to_attend_resources }}
              </nuxt-link>
            </td>
            <td>
              <a
                :href="harvester.remote_url"
                target="_blank"
                rel="noopener noreferrer"
                class="break-url"
              >
                {{ harvester.remote_url }}
              </a>
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
.break-url {
  word-break: break-all !important;
  display: inline-block !important;
}
</style>
