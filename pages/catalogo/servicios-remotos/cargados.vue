<script setup>
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();

const { data } = useAuth();
const token = data.value?.accessToken;
// console.log(token);
const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
const configEnv = useRuntimeConfig();
const baseUrl = configEnv.public.geonodeApi;
const harvesters = ref([]);
const resources = ref([]);
const remoteHaverstersResources = ref([]);
const harvestableResources = ref([]);
const cargando = ref(false);

const irARutaQuery = (v, destino) => {
  cargando.value = true;
  if (destino !== 'pendientes') {
    navigateTo({
      path: `/catalogo/servicios-remotos/${v.id}`,
      query: {
        id: v.id,
        title: v.title,
        unique_identifier: v.unique_identifier,
        remote_resource_type: v.remote_resource_type,
      },
    });
  } else {
    navigateTo({
      path: `/catalogo/servicios-remotos/importar`,
      query: {
        id: v.id,
        title: v.title,
        unique_identifier: v.unique_identifier,
        remote_resource_type: v.remote_resource_type,
      },
    });
  }
};

try {
  // petición a los recursos consechados de services remotos
  const responseHaversters = await $fetch(`${baseUrl}/harvesters`, {
    method: 'GET',
    headers: headers.value,
  });
  // console.log('responseHaversters', responseHaversters);
  harvesters.value = responseHaversters.harvesters;
  const responseResources = await $fetch(`${baseUrl}/resources?filter{resource_type}=service`, {
    method: 'GET',
    headers: headers.value,
  });
  // console.log('responseResources', responseResources);
  resources.value = responseResources.resources;

  // llenamos con los recursos remotos
  resources.value.forEach((d) =>
    harvesters.value.forEach(async (dd) => {
      // el identificador del owner es un número entero
      if (d.owner.pk === dd.default_owner) {
        const exportedResources = ref(0);
        harvestableResources.value = [];
        const totalResources = ref(0);
        const url = `${baseUrl}/harvesters/${dd.id}/harvestable-resources`;

        // obtenemos total de recursos
        const res = await $fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        totalResources.value = res.total;
        // obtenemos todos los recursos cosechados
        const response = await $fetch(`${url}/?page_size=${totalResources.value}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        harvestableResources.value = response.harvestable_resources;

        // filtramos por los remotos ya están importados a sigic junto con tipo de recurso
        exportedResources.value = harvestableResources.value.filter(
          (j) => j.should_be_harvested === true && j.remote_resource_type
        );

        // push al objeto final
        remoteHaverstersResources.value.push({
          id: dd.id,
          title: d.title,
          exported_resources: exportedResources.value.length,
          to_attend_resources: totalResources.value - exportedResources.value.length,
          remote_url: dd.remote_url,

          unique_identifier: exportedResources.value.map((e) => {
            return e.unique_identifier;
          }),
          remote_resource_type: exportedResources.value.map((e) => {
            return e.remote_resource_type;
          }),
        });
        // console.log('remoteHaverstersResources.value', remoteHaverstersResources.value);
      }
    })
  );
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
        v-if="remoteHaverstersResources.length !== 0 && !cargando"
        id="principal"
        class="contenedor m-b-10"
      >
        <h2>Carga catálogos externos</h2>
        <div class="ancho-fijo">
          <h3>Recursos cargados</h3>
          <p
            class="texto-color-alerta fondo-color-alerta borde borde-color-alerta p-2 borde-redondeado-8"
          >
            Los catálogos externos tienen funciones limitadas. Algunas descargas o consultas pueden
            no estar disponibles
          </p>
          <form>
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
            <div class="flex flex-contenido-inicio m-t-3">
              <nuxt-link
                class="boton boton-primario"
                aria-label="Ir a catálogo externo en mis archivos"
                to="/catalogo/mis-archivos"
                >Ver catálogo Externo en Mis Archivos
              </nuxt-link>
              <nuxt-link
                class="boton boton-secundario"
                aria-label="Agregar servicio remoto"
                to="/catalogo/servicios-remotos/agregar"
                >Agregar servicio remoto
              </nuxt-link>
            </div>
          </form>
        </div>
      </main>
      <main v-else>...cargando</main>
      <main v-if="cargando">...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
