<script setup>
// Esta vista ya no se usa
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();
const { gnoxyFetch } = useGnoxyUrl();

//const { data } = useAuth();
//const token = data.value?.accessToken;
// console.log(token);
//const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
const configEnv = useRuntimeConfig();
const baseUrl = configEnv.public.geonodeApi;
//const harvesters = ref([]);
//const resources = ref([]);
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalHarvesters = ref(0);
const totalPags = computed(() => Math.ceil(totalHarvesters.value / tamanioPagina));
const remoteHaverstersResources = ref([]);
//const harvestableResources = ref([]);
//const cargando = ref(false);

const irARutaQuery = (v, destino) => {
  //cargando.value = true;
  if (destino !== 'pendientes') {
    navigateTo({
      path: `/catalogo/servicios-remotos/${v.id}`,
      query: {
        id: v.id,
        title: v.title,
        total: v.exported_resources + v.to_attend_resources,
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

async function fetchHarvestersInfo() {
  try {
    const requestHarvesters = await gnoxyFetch(
      `${baseUrl}/harvesters/?page_size=${tamanioPagina}&page=${paginaActual.value + 1}`
    );
    const responseHarvesters = await requestHarvesters.json();
    totalHarvesters.value = responseHarvesters.total;
    const harvesters = responseHarvesters.harvesters;

    harvesters.forEach(async (h) => {
      const harvestableResourcesUrl = h.links.harvestable_resources;
      const resA = await gnoxyFetch(`${harvestableResourcesUrl}/?page_size=1`);
      const dataA = await resA.json();
      const totalResources = dataA.total;

      const res2 = await gnoxyFetch(`${harvestableResourcesUrl}/?page_size=${totalResources}`);
      const dataB = await res2.json();
      const harvestableResources = dataB.harvestable_resources;
      const exportedResources = harvestableResources.filter((j) => j.should_be_harvested === true);
      remoteHaverstersResources.value.push({
        id: h.id,
        title: h.name,
        exported_resources: exportedResources.length,
        to_attend_resources: totalResources - exportedResources.length,
        remote_url: h.remote_url,
      });
    });
  } catch (err) {
    console.warn('Error en el streaming: ' + err);
  }
}

fetchHarvestersInfo();

watch(paginaActual, () => {
  remoteHaverstersResources.value = [];
  fetchHarvestersInfo();
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <!-- <main
        v-if="remoteHaverstersResources.length !== 0 && !cargando"
        id="principal"
        class="contenedor m-b-10"
      > -->
      <main v-if="remoteHaverstersResources.length" id="principal" class="contenedor m-b-10">
        <h2>Carga catálogos externos</h2>
        <div class="ancho-fijo">
          <h3>Recursos cargados</h3>
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
          <!--           <form> -->
          <table>
            <thead>
              <tr>
                <th>Nombre de servicio externo</th>
                <th>Recursos importados</th>
                <th>Recursos pendientes</th>
                <th>URL</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="value in remoteHaverstersResources" :key="value.id">
                <td>{{ value.title }}</td>
                <td>
                  <nuxt-link @click="irARutaQuery(value, '')">
                    {{ value.exported_resources }}
                  </nuxt-link>
                </td>
                <td>
                  <nuxt-link @click="irARutaQuery(value, 'pendientes')">
                    {{ value.to_attend_resources }}
                  </nuxt-link>
                </td>
                <td>
                  <a :href="value.remote_url" target="_blank" rel="noopener noreferrer">
                    {{ value.remote_url }}
                  </a>
                </td>
                <td>Servcio de Mapas</td>
              </tr>
            </tbody>
          </table>
          <UiPaginador
            :pagina-parent="paginaActual"
            :total-paginas="totalPags"
            @cambio="paginaActual = $event"
          />
          <div class="flex flex-contenido-inicio m-t-3">
            <nuxt-link
              class="boton boton-primario"
              aria-label="Ir a catálogo externo en mis archivos"
              to="/catalogo/mis-archivos/metadatos-pendientes"
              >Editar Metadatos
            </nuxt-link>
            <nuxt-link
              class="boton boton-secundario"
              aria-label="Agregar servicio remoto"
              to="/catalogo/servicios-remotos/agregar"
              >Agregar Catálogo Externo
            </nuxt-link>
          </div>
          <!--           </form> -->
        </div>
      </main>
      <main v-else>
        <div class="flex">
          <div class="columna-4"></div>
          <div class="columna-8">
            <img
              src="/img/loader.gif"
              alt="Loader de SIGIC"
              style="width: 100%"
              class="color-invertir"
            />
          </div>
          <div class="columna-4"></div>
        </div>
      </main>
      <!-- <main v-if="cargando">
        <div class="flex">
          <div class="columna-4"></div>
          <div class="columna-8">
            <img
              src="/img/loader.gif"
              alt="Loader de SIGIC"
              style="width: 100%"
              class="color-invertir"
            />
          </div>
          <div class="columna-4"></div>
        </div>
      </main> -->
    </template>
  </UiLayoutPaneles>
</template>
