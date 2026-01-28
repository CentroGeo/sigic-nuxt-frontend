<script setup>
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();

const route = useRoute();
const selectedId = route.query.id;
const selectedTitle = route.query.title;
const harvestableResources = route.query.total;
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const importedResources = ref([]);
const isLoading = ref(true);
const fetchStatus = ref(null);

/**
 * Pide al endpoint de sigic-remote-datasets los recursos remotos asociados al selectedID
 */
async function fetchRemoteResources() {
  isLoading.value = true;

  try {
    const serviceUrl = `${config.public.geonodeApi}/sigic-remote-datasets/?harvester_id=${selectedId}`;
    const datasetRequest = await gnoxyFetch(serviceUrl);
    if (!datasetRequest.ok) {
      //const error = await requestRemotes.json();
      console.error('Falló petición de harvesters:');
      fetchStatus.value = 'failed';
    } else {
      const datasetsResponse = await datasetRequest.json();
      importedResources.value = datasetsResponse.datasets;
      fetchStatus.value = 'ok';
    }
  } catch {
    fetchStatus.value = 'failed';
  }

  isLoading.value = false;
}

/**
 * Asigna una etiqueta según el tipo de recurso
 * @param recurso
 */
function tipoRecurso(recurso) {
  let tipo;
  if (recurso.resource_type === 'document') {
    tipo = 'Documentos';
  } else {
    tipo = isGeometricExtension(recurso.extent) ? 'Capa Geográfica' : 'Datos Tabulados';
  }
  return tipo;
}

/**Redirecciona */
function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      id: selectedId,
      title: selectedTitle,
    },
  });
}

onMounted(() => {
  if (harvestableResources === '0') {
    isLoading.value = false;
    fetchStatus.value = 'ok';
  } else {
    //getServiceUrl();
    fetchRemoteResources();
  }
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <div class="flex">
          <nuxt-link
            to="/catalogo/explorar/catalogos-externos"
            aria-label="regresar a mis archivos"
          >
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
              aria-hidden="true"
            />
            <span class="h5 texto-color-primario p-l-2">Catálogos externos</span>
          </nuxt-link>
        </div>
        <h2>{{ selectedTitle }}</h2>
        <!--Cargando-->
        <div
          v-if="isLoading && harvestableResources !== '0'"
          class="flex flex-contenido-centrado m-y-5"
        >
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <!--Falló la petición-->
        <div v-if="!isLoading && fetchStatus !== 'ok'">
          <p
            class="texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
          >
            No pudimos completar la petición. Revisa tu conexión e intentalo de nuevo más tarde.
          </p>
        </div>

        <!--Aún no hay recursos importados-->
        <div v-if="harvestableResources === '0'">
          <div class="flex flex-contenido-centrado ancho-lectura borde-redondeado-16 sin-seleccion">
            <span class="pictograma-flkt pictograma-grande texto-color-error m-1"></span>
            <h3 class="texto-color-error m-1">Aún no se han importado recursos</h3>
            <p class="m-1">
              Cuando selecciones un conjunto de datos del catálogo, podrás explorarlo en esta
              sección
            </p>
            <div class="flex flex-contenido-inicio m-t-3">
              <nuxt-link
                class="boton boton-primario boton-chico"
                aria-label="Ir a importar Recursos"
                @click="irAImportarRecursos"
                >Importar Recursos
              </nuxt-link>
            </div>
          </div>
        </div>

        <!--Tabla de recursos-->
        <div v-if="!isLoading && importedResources.length > 0 && fetchStatus === 'ok'">
          <p
            class="texto-color-alerta fondo-color-alerta borde borde-color-alerta p-2 borde-redondeado-8"
          >
            Los catálogos externos tienen funciones limitadas. Algunas descargas o consultas pueden
            no estar disponibles. <br />
            <br />
            Los recursos importados requieren que
            <span style="font-weight: bold">completes sus metadatos</span> antes de poder
            visualizarlos.
          </p>

          <form>
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Resumen</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="resource in importedResources" :key="resource.pk">
                  <td>
                    <!--                  <nuxt-link @click="openResourceView(value)">{{ value.title }}</nuxt-link>-->
                    {{ resource.title }}
                  </td>
                  <td>{{ resource.raw_abstract }}</td>
                  <td>{{ tipoRecurso(resource) }}</td>
                </tr>
              </tbody>
            </table>
          </form>

          <div class="flex flex-contenido-inicio m-t-3">
            <nuxt-link
              class="boton boton-primario boton-chico"
              aria-label="Ir a editar metadatos"
              to="/catalogo/mis-archivos/metadatos-pendientes"
              >Editar metadatos
            </nuxt-link>
            <nuxt-link
              class="boton boton-secundario boton-chico"
              aria-label="Ir a recursos externos aún no importados"
              @click="irAImportarRecursos"
              >Ver recursos no importados
            </nuxt-link>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style scoped>
.sin-seleccion {
  background-color: var(--fondo-acento);
  gap: 8px;
  padding: 16px;
  text-align: center;
}
</style>
