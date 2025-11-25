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
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const selectedId = route.query.id;
const selectedTitle = route.query.title;
//const selectedUniqueIdentifier = route.query.unique_identifier;
//const selectedRemoteSourceType = route.query.remote_resource_type;
const dictTipoRecursoRemoto = {
  layers: 'Capas',
};
const selectedResources = ref([]);
const totalReources = ref();
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalReources.value / tamanioPagina));
const unharvestedResources = ref([]);
const harvesterStatus = ref(null);
/**
 *
 */
async function fetchData() {
  const configEnv = useRuntimeConfig();
  const baseUrl = configEnv.public.geonodeApi;
  const requestResources = await gnoxyFetch(
    `${baseUrl}/harvesters/${selectedId}/harvestable-resources/?page=${paginaActual.value + 1}`
  );
  const response = await requestResources.json();
  totalReources.value = response.total;
  const haverstableResources = response.harvestable_resources;
  unharvestedResources.value = haverstableResources.filter((d) => d.should_be_harvested === false);
}

/**
 *
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
 *
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
 *
 */
async function importarRecursos() {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const requestBody = selectedResources.value.map((d) => ({
    unique_identifier: d.unique_identifier,
    title: d.title,
    should_be_harvested: true,
  }));
  const updateHarvestables = await $fetch('/api/importar-externo', {
    method: 'POST',
    headers: { token: token },
    body: { harvesterID: selectedId, resources: requestBody },
  });
  let updateStatus;
  if (updateHarvestables) {
    updateStatus = await $fetch('/api/actualizar-externo', {
      method: 'POST',
      headers: { token: token },
      body: { id: selectedId, status: 'harvesting-resources' },
    });
    console.log('Se actualizo el estatus?', updateStatus);
  }
  if (updateStatus) {
    do {
      const res = await gnoxyFetch(`${config.public.geonodeApi}/harvesters/${selectedId}`);
      const info = await res.json();
      harvesterStatus.value = info.harvester.status;
      console.warn('Harvester Status:', harvesterStatus.value);

      if (harvesterStatus.value === 'ready') break;

      await wait(5000);
    } while (harvesterStatus.value !== 'ready');
  }
}
watch(paginaActual, () => {
  fetchData();
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
      <main v-if="unharvestedResources.length > 0" id="principal" class="contenedor m-b-10 m-y-3">
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
              <tr v-for="value in unharvestedResources" :key="value.unique_identifier">
                <td>
                  <!-- <ClientOnly>
                    <SisdaiCasillaVerificacion :etiqueta="value.unique_identifier" />
                  </ClientOnly> -->
                  <input
                    :id="`checkbox-${value.unique_identifier}`"
                    type="checkbox"
                    name="checkboxes"
                    :checked="isSelected(value)"
                    @change="toggleSelection(value)"
                  />
                  <label :for="`checkbox-${value.unique_identifier}`">
                    {{ value.unique_identifier }}
                  </label>
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
