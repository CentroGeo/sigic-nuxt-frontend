<script setup>
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
const controlDeslizante = ref(null);
const generaIdAleatorio = (el) => {
  return el + Math.random().toString(36).substring(2);
};
const idAleatorioControlDes = generaIdAleatorio('controldeslizante-');

const statusOk = ref(false);
const pending = ref(false);

const route = useRoute();
// const resource = ref({});
function getUserData() {
  // if (route.query.userObject) {
  //   try {
  //     return JSON.parse(route.query.userObject);
  //   } catch (e) {
  //     console.error('Error parsing user object', e);
  //     return null;
  //   }
  // }
  if (route.query.data) {
    try {
      const dataStr = decodeURIComponent(route.query.data);
      return computed(() => JSON.parse(dataStr));
    } catch (e) {
      console.error('Error al parsear el objeto', e);
      return null;
    }
  }
}
const objetoId = ref(getUserData());
// obtener el resource completo a partir del id
const resource = ref({});
resource.value = await $fetch('/api/objeto', {
  method: 'POST',
  body: { id: objetoId.value.pk },
});
console.log(resource.value);

const { data } = useAuth();

const dragNdDrop = ref(null);

async function guardarArchivo(files) {
  // const token = data.value?.accessToken;

  if (
    files[0].name.split('.')[1] === '.sld' ||
    files[0].name.endsWith('.sld') ||
    files[0].type === '.sld' ||
    files[0].type === 'application/vnd.sld+xml' ||
    files[0].type === 'application/vnd.sld+xml,.sld'
  ) {
    const formData = new FormData();
    // solo el primer elemento del arreglo
    formData.append('base_file', files[0]);
    // formData.append('dataset_title', resource.dataset_title);
    // formData.append('dataset_title', 'geonode:coordinaciones');
    formData.append('dataset_title', 'geonode:coordinaciones_5512c0b1ad0c84af59d3e9182b06c97c');
    formData.append('token', data.value?.accessToken);

    const response = await $fetch('/api/subirSLD', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al cargar archivos: ${response.status}`);
    } else {
      // pending.value = false;
      // statusOk.value = true;
      // TODO: recuperar recurso o recursos mediante el name y title
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }

  // pending.value = true;
  // // remover timeout
  // setTimeout(() => {
  //   if (res.ok) {
  //     pending.value = false;
  //     statusOk.value = true;
  //   }
  // }, '2500');
}
const bordeEnlaceActivo = (ruta) => {
  if (route.path === ruta) {
    return 'borde-enlace-activo';
  }
  return '';
};

function irAMetadatosConQuery() {
  // Función para codificar un objeto que se va a pasar al navegar a otra vista.
  // evitar problemas con espacios con JSON.stingify
  const pk = encodeURIComponent(JSON.stringify({ pk: resource.value.pk }));
  navigateTo({
    path: '/catalogo/mis-archivos/editar-metadatos',
    query: { data: pk },
  });
}
function irAEstiloConQuery() {
  // Función para codificar un objeto que se va a pasar al navegar a otra vista.
  // evitar problemas con espacios con JSON.stingify
  const pk = encodeURIComponent(JSON.stringify({ pk: resource.value.pk }));
  navigateTo({
    path: '/catalogo/mis-archivos/editar-estilo',
    query: { data: pk },
  });
}
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h2 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex">
            <div class="columna-16">
              <h2>{{ resource.title }}</h2>
              <div class="flex">
                <nuxt-link
                  :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar-metadatos')"
                  @click="irAMetadatosConQuery"
                  >Metadatos
                </nuxt-link>
                <nuxt-link
                  :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar-estilo')"
                  @click="irAEstiloConQuery"
                  >Estilo</nuxt-link
                >
              </div>
              <div class="borde-b borde-color-secundario"></div>
              <h2>Estilo</h2>
              <p><b>Estilo, solo archivos .sld</b></p>

              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  ref="dragNdDrop"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="statusOk">
                <!-- <div v-if="true"> -->
                <h2>Cargas recientes</h2>
                <div class="fondo-color-confirmacion p-3 borde-redondeado-16">
                  <div class="flex texto-color-confirmacion">
                    <span class="pictograma-aprobado" />
                    <b> Archivo cargado correctamente </b>
                  </div>

                  <p>Capas_lago_texcoco.json</p>

                  <div>
                    <nuxt-link to="/catalogo/mis-archivos">Ver en mis archivos</nuxt-link>
                  </div>
                </div>
              </div>
              <div v-if="pending">
                <h2>Cargas pendientes</h2>
                <div class="fondo-color-neutro p-3 borde-redondeado-16">
                  <div class="flex flex-contenido-separado">
                    <p class="flex-vertical-centrado">nombre de la capa.json</p>
                    <div class="flex">
                      <p class="borde borde-redondeado-8" style="padding: 4px">.sld</p>
                      <p class="flex-vertical-centrado">1MB</p>
                    </div>
                  </div>
                  <ClientOnly>
                    <SisdaiControlDeslizante
                      :id="idAleatorioControlDes"
                      ref="controlDeslizante"
                      :val_min="0"
                      :val_max="100"
                      :val_entrada="90"
                      step="10"
                      @blur="false"
                      @update:val_entrada="
                        ($event) => (controlDeslizante.valor_seleccionado = $event)
                      "
                    />
                  </ClientOnly>
                  <div class="flex flex-contenido-inicio">
                    <label :for="idAleatorioControlDes"
                      >{{
                        controlDeslizante?.valor_seleccionado < 100 ? 'Progreso' : 'Completado'
                      }}
                      {{ controlDeslizante?.valor_seleccionado }}%</label
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.borde-enlace-activo {
  border-bottom: 4px solid var(--boton-primario-borde);
  border-radius: 0px;
}
</style>
