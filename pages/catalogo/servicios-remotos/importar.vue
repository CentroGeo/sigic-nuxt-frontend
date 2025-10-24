<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';

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
const selectedUniqueIdentifier = route.query.unique_identifier;
const selectedRemoteSourceType = route.query.remote_resource_type;

const notShouldBeHarvested = ref([]);
const dictTipoRecursoRemoto = {
  layers: 'Capas',
};

function importarRecursos() {
  // TODO: importar recursos al backend
  const harvestestToImport = notShouldBeHarvested.value.filter((d) => d.check === true);
  console.warn('harvestestToImport', harvestestToImport);
  navigateTo({
    path: `/catalogo/servicios-remotos/${selectedId}`,
    query: {
      id: selectedId,
      title: selectedTitle,
      unique_identifier: selectedUniqueIdentifier,
      remote_resource_type: selectedRemoteSourceType,
    },
  });
}

const totalReources = ref();
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalReources.value / tamanioPagina));

async function fetchData() {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

  const configEnv = useRuntimeConfig();
  const baseUrl = configEnv.public.geonodeApi;

  const response = await $fetch(
    `${baseUrl}/harvesters/${selectedId}/harvestable-resources/?page=${paginaActual.value + 1}`,
    {
      method: 'GET',
      headers: headers.value,
    }
  );
  // console.log('response', response);
  totalReources.value = response.total;
  const haverstableResources = response.harvestable_resources;
  // console.log('haverstableResources', haverstableResources);

  // filtramos los que aún no están importados
  const filteredNotShouldBeHarvested = haverstableResources.filter(
    (d) => d.should_be_harvested === false
  );
  // console.log('notShouldBeHarvested', notShouldBeHarvested);

  // agregamos la propiedad check para la casilla de verificación
  notShouldBeHarvested.value = filteredNotShouldBeHarvested.map((d) => ({
    last_updated: d.last_updated,
    remote_resource_type: d.remote_resource_type,
    should_be_harvested: d.should_be_harvested,
    status: d.status,
    title: d.title,
    unique_identifier: d.unique_identifier,
    check: false,
  }));
}

async function fetchNewData() {
  await fetchData();
}

watch(paginaActual, () => {
  fetchNewData();
});

try {
  await fetchData();
} catch (err) {
  console.warn('Error en el streaming: ' + err);
}
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="true" id="principal" class="contenedor m-b-10 m-y-3">
        <h2>Carga catálogos externos</h2>
        <h3>{{ selectedTitle }}</h3>
        <p>Selecciona los recursos que quieres importar</p>
        <form @submit.prevent>
          <table class="tabla-condensada">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Título</th>
                <th>Resumen</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="value in notShouldBeHarvested" :key="value.unique_identifier">
                <td>
                  <ClientOnly>
                    <SisdaiCasillaVerificacion
                      v-model="value.check"
                      :etiqueta="value.unique_identifier"
                    />
                  </ClientOnly>
                </td>
                <td>{{ value.title }}</td>
                <td></td>
                <td>{{ dictTipoRecursoRemoto[value.remote_resource_type] }}</td>
              </tr>
            </tbody>
          </table>
        </form>
        <ClientOnly>
          <UiPaginador
            :pagina-parent="paginaActual"
            :total-paginas="totalPags"
            @cambio="paginaActual = $event"
          />
        </ClientOnly>
        <div class="flex flex-contenido-inicio m-t-3">
          <button
            class="boton-primario"
            aria-label="Importar recursos de catálogo externo"
            type="button"
            @click="importarRecursos"
          >
            Importar recursos
          </button>
        </div>
      </main>
      <main v-else>...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
