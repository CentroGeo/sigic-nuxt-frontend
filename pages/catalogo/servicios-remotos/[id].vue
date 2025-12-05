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
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const selectedHarvester = ref({});
const harvesterUrl = ref(undefined);
const importedResources = ref([]);
const isLoading = ref(true);
const fetchStatus = ref(null);
const url = ref(`${config.public.geonodeApi}/resources/?filter{subtype.in}=remote&page_size=70`);
async function getServiceUrl() {
  let url = `${config.public.geonodeApi}/harvesters/`;
  let harvesters = [];
  do {
    // Obtenemos la información de los harvesters
    const requestHarvesters = await gnoxyFetch(url);
    if (!requestHarvesters.ok) {
      const error = await requestHarvesters.json();
      console.error('Falló petición de harvesters:', error);
    }
    const resHarvesters = await requestHarvesters.json();
    harvesters = [...harvesters, ...resHarvesters.harvesters];

    // Revisamos si ya encontramos el harvester que nos interesa
    harvesters.forEach((d) => {
      if (d.id === Number(selectedId)) {
        selectedHarvester.value = d;
        harvesterUrl.value = d.remote_url.replace('https://', '').split('/')[0];
      }
    });

    // Si lo encontramos, detenemos el loop
    if (Object.keys(selectedHarvester.value).length > 0) {
      url = undefined;
    } else {
      url = resHarvesters.links.next;
    }
  } while (url);
}

async function fetchRemoteResources() {
  isLoading.value = true;

  try {
    const requestRemotes = await gnoxyFetch(`${url.value}`);
    if (!requestRemotes.ok) {
      const error = await requestRemotes.json();
      console.error('Falló petición de harvesters:', error);
    }
    const resRemotes = await requestRemotes.json();
    url.value = resRemotes.links.next;
    resRemotes.resources.forEach((d) => {
      const objetcLink = d.links.find((link) => link.link_type === 'OGC:WMS');
      if (objetcLink.url.includes(harvesterUrl.value)) {
        importedResources.value.push(d);
      }
    });
    fetchStatus.value = 'ok';
  } catch {
    fetchStatus.value = 'failed';
  }
  /*   try {
    do {
      const requestRemotes = await gnoxyFetch(url.value);
      if (!requestRemotes.ok) {
        const error = await requestRemotes.json();
        console.error('Falló petición de harvesters:', error);
      }
      const resRemotes = await requestRemotes.json();
      url.value = resRemotes.links.next;
      resRemotes.resources.forEach((d) => {
        const objetcLink = d.links.find((link) => link.link_type === 'OGC:WMS');
        if (objetcLink.url.includes(harvesterUrl.value)) {
          importedResources.value.push(d);
        }
      });
    } while (url);
    fetchStatus.value = 'ok';
  } catch {
    fetchStatus.value = 'failed';
  } */

  isLoading.value = false;
}

function tipoRecurso(recurso) {
  let tipo;
  if (recurso.resource_type === 'document') {
    tipo = 'Documentos';
  } else {
    tipo = isGeometricExtension(recurso.extent) ? 'Capa Geográfica' : 'Datos Tabulados';
  }
  return tipo;
}

function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      id: selectedId,
      title: selectedTitle,
      /* unique_identifier: selectedUniqueIdentifier,
     remote_resource_type: selectedRemoteSourceType, */
    },
  });
}
getServiceUrl();
watch(harvesterUrl, () => {
  fetchRemoteResources();
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="true" id="principal" class="contenedor m-b-10 m-y-3">
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
        <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
          <p class="columna-16 texto-color-error" style="text-align: center">{{ url }}</p>
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
        <div v-if="!isLoading && importedResources.length === 0 && fetchStatus === 'ok'">
          <p
            class="texto-color-informacion fondo-color-informacion borde borde-color-informacion p-2 borde-redondeado-8"
          >
            Aún no se han importado recursos
          </p>
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
        </div>

        <div v-if="!isLoading" class="flex flex-contenido-inicio m-t-3">
          <nuxt-link
            v-if="!isLoading && importedResources.length > 0"
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
      </main>
    </template>
  </UiLayoutPaneles>
</template>
