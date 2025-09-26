<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';

const storeCatalogo = useCatalogoStore();

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const casilla = ref('');

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

// const { data } = useAuth();
// const token = data.value?.accessToken;
// console.log(token);
// const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
// const configEnv = useRuntimeConfig();
// const baseUrl = configEnv.public.geonodeApi;
// const totalResources = ref(0);
// const filteredAlternateResources = ref([]);
// const { gnoxyUrl } = useGnoxyUrl();
// try {
//   const res = await $fetch(`${baseUrl}/resources?custom=true&filter{subtype.in}=remote`, {
//     method: 'GET',
//     headers: headers.value,
//   });
//   totalResources.value = res.total;
//   const response = await $fetch(
//     `${baseUrl}/resources/?custom=true&filter{subtype.in}=remote&page_size=${totalResources.value}`,
//     {
//       method: 'GET',
//       headers: headers.value,
//     }
//   );
//   const resources = response.resources;
//   // const filteredRemoteResources = resources.filter((resource) => resource.sourcetype === 'REMOTE');
//   resources.forEach((d) =>
//     b.value.forEach((dd) => {
//       if (d.alternate === dd.unique_identifier) {
//         filteredAlternateResources.value.push({
//           title: d.title,
//           abstract: d.abstract,
//           remote_resource_type: dd.remote_resource_type,
//           uuid: d.uuid,
//         });
//       }
//     })
//   );
//   // console.log('filteredAlternateResources', filteredAlternateResources);
// } catch (err) {
//   console.warn('Error en el streaming: ' + err);
// }
// /**
//  * Agrega un recurso seleccionado al módulo de consulta y navega a la vista
//  * @param resource del que se toma el uuid para la selección
//  */
// async function openResourceView(resource) {
//   useSelectedResources2Store().add(
//     new SelectedLayer({ uuid: resource.uuid }),
//     resourceTypeDic.dataLayer
//   );
//   await navigateTo('/consulta/capas');
// }
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
              <tr>
                <td>
                  <ClientOnly>
                    <SisdaiCasillaVerificacion
                      v-model="casilla"
                      :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/1`"
                    />
                  </ClientOnly>
                </td>
                <td>Estados</td>
                <td></td>
                <td>Capa</td>
              </tr>
              <tr>
                <td>
                  <ClientOnly>
                    <SisdaiCasillaVerificacion
                      v-model="casilla"
                      :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2`"
                    />
                  </ClientOnly>
                </td>
                <td>Municipios</td>
                <td></td>
                <td>Capa</td>
              </tr>
              <tr>
                <td>
                  <ClientOnly>
                    <SisdaiCasillaVerificacion
                      v-model="casilla"
                      :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/3`"
                    />
                  </ClientOnly>
                </td>
                <td>Localidades</td>
                <td></td>
                <td>Capa</td>
              </tr>
            </tbody>
          </table>
          <div class="flex flex-contenido-inicio m-t-3">
            <button
              class="boton-primario"
              aria-label="Importar recursos de catálogo externo"
              type="button"
              @click="console.log('épale')"
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
