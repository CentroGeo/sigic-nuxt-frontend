<script setup>
// import { resourceTypeDic } from '~/utils/consulta';
// const storeFilters = useFilteredResources();
// const storeFetched = useFetchedResources2Store();
// storeFetched.checkFilling(resourceTypeDic.dataLayer);
// storeFetched.checkFilling(resourceTypeDic.dataTable);
// storeFetched.checkFilling(resourceTypeDic.document);
// const recursos = computed(() => storeFetched.all);
// const filteredRemoteResources = ref([]);
// function updateResources(nuevosRecursos) {
//   filteredRemoteResources.value = nuevosRecursos;
//   // filteredRemoteResources.value = filteredRemoteResources.value.filter(
//   //   (resource) => resource.sourcetype === 'REMOTE'
//   // );
//   filteredRemoteResources.value = filteredRemoteResources.value.filter(
//     (resource) => resource.alternate === selectedUniqueIdentifier.map((d) => d)
//   );
//   console.log('filteredRemoteResources', filteredRemoteResources.value);
// }
// watch([recursos], () => {
//   updateResources(storeFilters.filter('all'));
// });
// onMounted(() => {
//   storeFilters.resetAll();
//   if (recursos.value.length !== 0) {
//     updateResources(recursos.value);
//   }
// });
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const route = useRoute();
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

const { data } = useAuth();
const token = data.value?.accessToken;
// console.log(token);
const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
const configEnv = useRuntimeConfig();
const baseUrl = configEnv.public.geonodeApi;

const totalResources = ref(0);
const filteredAlternateResources = ref([]);

// const { gnoxyUrl } = useGnoxyUrl();

try {
  const res = await $fetch(`${baseUrl}/resources`, {
    method: 'GET',
    headers: headers.value,
  });
  totalResources.value = res.total;
  const response = await $fetch(
    `${baseUrl}/resources/?custom=true&page_size=${totalResources.value}`,
    {
      method: 'GET',
      headers: headers.value,
    }
  );
  const resources = response.resources;
  const filteredRemoteResources = resources.filter((resource) => resource.sourcetype === 'REMOTE');

  filteredRemoteResources.forEach((d) =>
    b.value.forEach((dd) => {
      if (d.alternate === dd.unique_identifier) {
        filteredAlternateResources.value.push({
          title: d.title,
          abstract: d.abstract,
          remote_resource_type: dd.remote_resource_type,
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
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="filteredAlternateResources.length !== 0" id="principal" class="contenedor m-b-10">
        <h2>Carga catálogos externos</h2>
        <h3>{{ selectedTitle }}</h3>
        <form>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Título</th>
                <th>Resumen</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="value in filteredAlternateResources" :key="value.pk">
                <td><a href="#verenvisor">{ { value.url } }</a></td>
                <td>
                  {{ value.title }}
                </td>
                <td>{{ value.abstract }}</td>
                <td>{{ value.remote_resource_type }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex flex-contenido-inicio m-t-3">
            <nuxt-link
              class="boton boton-primario"
              aria-label="Ir a recursos externos aún no importados"
              to="/catalogo/mis-archivos"
              >Ver recursos no importados</nuxt-link
            >
          </div>
        </form>
      </main>
      <main v-else>...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
