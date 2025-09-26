<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';

const storeCatalogo = useCatalogoStore();

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const route = useRoute();
const selectedId = route.query.id;
const selectedTitle = route.query.title;
const selectedUniqueIdentifier = route.query.unique_identifier;
const selectedRemoteSourceType = route.query.remote_resource_type;
const b = ref([]);
for (let index = 0; index < selectedUniqueIdentifier.length; index++) {
  b.value.push({
    unique_identifier: selectedUniqueIdentifier[index],
    remote_resource_type: selectedRemoteSourceType[index],
  });
}

const casilla = ref('');
const notShouldBeHarvested = ref([]);
const dictTipoRecursoRemoto = {
  layers: 'Capas',
};

function importarRecursos() {
  // TODO: importar recursos al backend
  console.warn('épale');
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

try {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

  const configEnv = useRuntimeConfig();
  const baseUrl = configEnv.public.geonodeApi;

  const page = ref(1);
  // TODO: paginación de recursos
  // const linksNext = ref(null);
  const haverstableResources = ref([]);

  const response = await $fetch(
    `${baseUrl}/harvesters/${selectedId}/harvestable-resources/?page=${page.value}`,
    {
      method: 'GET',
      headers: headers.value,
    }
  );
  // console.log('response', response);
  haverstableResources.value = response.harvestable_resources;
  // console.log('haverstableResources.value', haverstableResources.value);
  notShouldBeHarvested.value = haverstableResources.value.filter(
    (d) => d.should_be_harvested === false
  );
  // console.log('notShouldBeHarvested.value', notShouldBeHarvested.value);
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
                      v-model="casilla"
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
        </form>
      </main>
      <main v-else>...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
