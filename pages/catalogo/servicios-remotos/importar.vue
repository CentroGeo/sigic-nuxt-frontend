<script setup>
import { wait } from '@/utils/consulta';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();
const config = useRuntimeConfig();
const { status, signIn } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const selectedId = route.query.id;
const selectedTitle = route.query.title;
const harvesterStatus = ref(null);
const totalResources = ref();
const harvestableResources = ref([]);
const selectedResources = ref([]);
const fetchingHarvestableResources = ref(true);
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));
const importingActive = ref(false);
const isLoadingPage = ref(false);
const didUpdateFail = ref(false);
const didUpdateSucceed = ref(false);
const dictTipoRecursoRemoto = {
  layers: 'Capas',
};

async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: route.fullPath,
  });
}

/**
 * Esta función permite conocer el estatus del harvester.
 * Si el harvester no está listo, no se podrán importar recursos.
 **/
async function checkStatus() {
  const baseUrl = config.public.geonodeApi;
  const requestResources = await gnoxyFetch(`${baseUrl}/harvesters/${selectedId}/`);
  const response = await requestResources.json();
  harvesterStatus.value = response.harvester.status;
}

/**
 * Obtenemos los recursos cosechables por página
 */
async function fetchData() {
  const baseUrl = config.public.geonodeApi;
  const requestResources = await gnoxyFetch(
    `${baseUrl}/harvesters/${selectedId}/harvestable-resources/?filter{should_be_harvested}=false&page=${paginaActual.value + 1}`
  );
  const response = await requestResources.json();
  totalResources.value = response.total;
  harvestableResources.value = response.harvestable_resources;
}

/**
 * Identifica si un recurso ha sido seleccionado o no.
 * Esto se usa debido a que los recursos mostrados no viven eternamente aqui.
 * @param resource
 */
function isSelected(resource) {
  const resourceID = resource.unique_identifier;
  const selectedIDs = selectedResources.value.map((d) => d.unique_identifier);
  if (selectedIDs.includes(resourceID)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Al marcar una casilla del checklist, agrega el recurso a la seleccion
 * Al desmarcarla, elimina el recurso de la selección
 * @param resource
 */
function toggleSelection(resource) {
  const resourceID = resource.unique_identifier;
  const selectedIDs = selectedResources.value.map((d) => d.unique_identifier);
  if (selectedIDs.includes(resourceID)) {
    selectedResources.value = selectedResources.value.filter(
      (d) => d.unique_identifier !== resourceID
    );
  } else {
    selectedResources.value.push(resource);
  }
}

/**
 * Importa los recursos usando el harvester
 */
async function importarRecursos() {
  importingActive.value = true;
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const requestBody = selectedResources.value.map((d) => ({
    unique_identifier: d.unique_identifier,
    title: d.title,
    should_be_harvested: true,
  }));
  // Primero hacemos una petición para actualizar el estatus de cosecha de cada recurso
  const updateHarvestables = await $fetch('/api/importar-externo', {
    method: 'POST',
    headers: { token: token },
    body: { harvesterID: selectedId, resources: requestBody },
  });

  // Ahora actualizamos el estatus del harvester para activar la importación de los recursos
  let updateStatus;
  if (updateHarvestables) {
    updateStatus = await $fetch('/api/actualizar-externo', {
      method: 'POST',
      headers: { token: token },
      body: { id: selectedId, status: 'harvesting-resources' },
    });
  } else {
    didUpdateFail.value = false;
    importingActive.value = false;
    return;
  }

  // Si logramos actualizar exitosamente el estatus, revisamos el estatus del harvester hasta que diga ready
  if (updateStatus) {
    do {
      const res = await gnoxyFetch(`${config.public.geonodeApi}/harvesters/${selectedId}`);
      const info = await res.json();
      harvesterStatus.value = info.harvester.status;
      console.warn('Harvester Status:', harvesterStatus.value);

      if (harvesterStatus.value === 'ready') break;

      await wait(5000);
    } while (harvesterStatus.value !== 'ready');
    selectedResources.value = [];
    fetchData();
    didUpdateSucceed.value = true;
    importingActive.value = false;
  } else {
    didUpdateFail.value = false;
    importingActive.value = false;
    return;
  }
}

/**
 * Formatea fechas
 * @param date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    // month: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

watch(paginaActual, async () => {
  isLoadingPage.value = true;
  await fetchData();
  isLoadingPage.value = false;
});

onMounted(async () => {
  fetchingHarvestableResources.value = true;
  await checkStatus();
  await fetchData();
  fetchingHarvestableResources.value = false;
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <!--Boton superior izquierda-->
        <div class="flex alineacion-izquierda ancho-lectura">
          <nuxt-link
            to="/catalogo/explorar/catalogos-externos"
            aria-label="regresar a mis archivos"
          >
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
              aria-hidden="true"
            />
            <span class="h5 texto-color-primario p-l-2">Catalogos Externos</span>
          </nuxt-link>
        </div>

        <h1 class="m-y-1">{{ selectedTitle }}</h1>

        <!-- Cargando harvestable resources-->
        <div v-if="fetchingHarvestableResources" class="flex flex-contenido-centrado m-t-5">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <!-- Recursos cosechables listos -->
        <div v-else>
          <!--Cuadro de información de inicio de sesión-->
          <div
            v-if="status !== 'authenticated'"
            class="fondo-color-informacion texto-color-informacion borde-redondeado-16 borde -color-informacion m-t-2"
            style="padding: 21px"
          >
            <h6 class="m-y-2">¿Quieres visualizar capas de este catálogo?</h6>
            <p class="m-y-1">
              Puedes importar recursos de información para visualizarlos en la plataforma SIGIC,
              para ello debes iniciar sesión con una cuenta existente o crear una y completar el
              proceso de importación.
            </p>
            <a href="#" style="font-weight: bold" @click.prevent="iniciarSesion(event)"
              >Iniciar sesión</a
            >
          </div>

          <!--Cuadro de información de que el servicio no está listo-->
          <div
            v-if="harvesterStatus !== 'ready' && !importingActive && status === 'authenticated'"
            class="tarjeta fondo-color-alerta ancho-lectura m-t-3"
          >
            <div class="tarjeta-cuerpo">
              <h3 class="texto-color-alerta" style="text-align: center">
                <span class="pictograma-actualizar"></span>El servicio está ocupado
              </h3>
              <p class="texto-color-alerta">
                Espera a que el estatus del servicio aparezca como Listo para poder importar
                recursos.
              </p>
            </div>
          </div>

          <!--Cuadro de información de que no hay recursos para importarlos-->
          <div
            v-if="
              harvesterStatus === 'ready' &&
              !fetchingHarvestableResources &&
              harvestableResources.length === 0
            "
            class="tarjeta fondo-color-informacion ancho-lectura m-t-3"
          >
            <div class="tarjeta-cuerpo">
              <h3 class="texto-color-informacion">
                <span class="pictograma-aprobado"></span>Sin recursos a importar
              </h3>
              <p class="texto-color-informacion">
                Todos los recursos de este servicio han sido cosechados.
              </p>
            </div>
          </div>

          <!--Instrucciones-->
          <p v-if="harvestableResources.length > 0">
            Explora los recursos disponibles y selecciona los que desees importar.
          </p>

          <!--Alertas de importación-->
          <div>
            <div
              v-if="importingActive"
              class="m-y-2 flex flex-contenido-inicio texto-color-informacion fondo-color-informacion p-1 borde borde-color-informacion borde-redondeado-8"
            >
              <div class="flex-vertical-centrado columna-2">
                <img src="/img/loader.gif" alt="...Cargando" class="loader color-invertir" />
              </div>
              <p class="columna-14">
                Estamos importando los recursos. Este proceso puede demorar unos minutos.
              </p>
            </div>
            <p
              v-if="didUpdateFail"
              class="texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
            >
              <span class="pictograma-alerta" /> Ocurrió un error. Revisa tu conexión e intentalo de
              nuevo más tarde.
            </p>
            <p
              v-if="didUpdateSucceed"
              class="flex flex-contenido-separado texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion p-2 borde-redondeado-8"
            >
              <span><span class="pictograma-aprobado" /> Recursos importados con éxito.</span>
              <nuxt-link to="/catalogo/mis-archivos/metadatos-pendientes"
                >Ir a Editar Metadatos</nuxt-link
              >
            </p>
          </div>

          <!--Tabla de recursos-->
          <div v-if="harvestableResources.length > 0">
            <table class="tabla-condensada">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Título</th>
                  <th>Última actualización</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody v-if="!isLoadingPage">
                <tr v-for="value in harvestableResources" :key="value.unique_identifier">
                  <td>
                    <input
                      :id="`checkbox-${value.unique_identifier}`"
                      type="checkbox"
                      name="checkboxes"
                      :checked="isSelected(value)"
                      :disabled="status !== 'authenticated'"
                      @change="toggleSelection(value)"
                    />
                    <label :for="`checkbox-${value.unique_identifier}`">
                      {{ value.unique_identifier }}
                    </label>
                  </td>
                  <td>{{ value.title }}</td>
                  <td>{{ formatDate(value.last_updated) }}</td>
                  <td>{{ dictTipoRecursoRemoto[value.remote_resource_type] }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="isLoadingPage" class="flex flex-contenido-centrado m-y-2">
              <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="32px" />
            </div>
            <ClientOnly>
              <UiPaginador
                :pagina-parent="paginaActual"
                :total-paginas="totalPags"
                @cambio="paginaActual = $event"
              />
            </ClientOnly>
          </div>

          <!--Botones-->
          <div class="flex flex-contenido-inicio m-t-3">
            <button
              v-if="status !== 'authenticated'"
              class="boton-primario boton-chico"
              aria-label="Iniciar sesión"
              type="button"
              @click="iniciarSesion"
            >
              Iniciar Sesión
            </button>
            <button
              v-if="harvestableResources.length !== 0"
              class="boton-primario boton-chico"
              aria-label="Importar recursos de catálogo externo"
              type="button"
              :disabled="
                status !== 'authenticated' || harvesterStatus !== 'ready' || importingActive
              "
              @click="importarRecursos"
            >
              Importar recursos
            </button>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.loader {
  max-height: 3em;
  object-fit: scale-down;
}
</style>
