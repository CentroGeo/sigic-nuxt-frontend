<script setup>
import { resourceTypeDic } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';

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

// armamos el objeto con los que ya están importados
const b = ref([]);
for (let index = 0; index < selectedUniqueIdentifier.length; index++) {
  b.value.push({
    unique_identifier: selectedUniqueIdentifier[index],
    remote_resource_type: selectedRemoteSourceType[index],
  });
}

const { data } = useAuth();
const token = data.value?.accessToken;
// console.log(token);
const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
const configEnv = useRuntimeConfig();
const baseUrl = configEnv.public.geonodeApi;
const totalResources = ref(0);
const filteredAlternateResources = ref([]);
const dictTipoRecursoRemoto = {
  layers: 'Capas',
};

function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      id: selectedId,
      title: selectedTitle,
      unique_identifier: selectedUniqueIdentifier,
      remote_resource_type: selectedRemoteSourceType,
    },
  });
}

/**
 * Agrega un recurso seleccionado al módulo de consulta y navega a la vista
 * @param resource del que se toma el uuid para la selección
 */
async function openResourceView(resource) {
  useSelectedResources2Store().add(
    new SelectedLayer({ uuid: resource.uuid }),
    resourceTypeDic.dataLayer
  );
  await navigateTo('/consulta/capas');
}

try {
  const res = await $fetch(`${baseUrl}/resources?custom=true&filter{subtype.in}=remote`, {
    method: 'GET',
    headers: headers.value,
  });
  totalResources.value = res.total;
  const response = await $fetch(
    `${baseUrl}/resources/?custom=true&filter{subtype.in}=remote&page_size=${totalResources.value}`,
    {
      method: 'GET',
      headers: headers.value,
    }
  );
  const resources = response.resources;
  // const filteredRemoteResources = resources.filter((resource) => resource.sourcetype === 'REMOTE');
  resources.forEach((d) =>
    b.value.forEach((dd) => {
      if (d.alternate === dd.unique_identifier) {
        filteredAlternateResources.value.push({
          title: d.title,
          abstract: d.abstract,
          raw_abstract: d.raw_abstract,
          remote_resource_type: dd.remote_resource_type,
          uuid: d.uuid,
        });
      }
    })
  );
  // console.log('filteredAlternateResources', filteredAlternateResources);
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
      <main
        v-if="filteredAlternateResources.length !== 0"
        id="principal"
        class="contenedor m-b-10 m-y-3"
      >
        <div class="flex">
          <nuxt-link to="/catalogo/servicios-remotos" aria-label="regresar a mis archivos">
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
              aria-hidden="true"
            />
            <span class="h5 texto-color-primario p-l-2">Conexiones remotas</span>
          </nuxt-link>
        </div>
        <h2>Carga catálogos externos</h2>
        <h3>{{ selectedTitle }}</h3>
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
              <tr v-for="value in filteredAlternateResources" :key="value.pk">
                <td>
                  <nuxt-link @click="openResourceView(value)">{{ value.title }}</nuxt-link>
                </td>
                <td>{{ value.raw_abstract }}</td>
                <td>{{ dictTipoRecursoRemoto[value.remote_resource_type] }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex flex-contenido-inicio m-t-3">
            <nuxt-link
              class="boton boton-primario"
              aria-label="Ir a recursos externos aún no importados"
              @click="irAImportarRecursos"
              >Ver recursos no importados
            </nuxt-link>
          </div>
        </form>
      </main>
      <main v-else>...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
