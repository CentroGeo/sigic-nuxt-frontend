<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const route = useRoute();
function getUserData() {
  // Función que devuelve el objeto decodificado
  // de la vista de donde viene
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

const imagen = ref();
const campoResumen = ref('Resumen desde sigic');
const campoTitulo = ref('');
const campoPalabrasClave = ref('');
const campoAutor = ref('');
const campoAnioPublicacion = ref('');
const seleccionEjemplo = ref('');
const seleccionFecha = ref('');
const seleccionCategoria = ref('');
const seleccionGrupo = ref('');

// obtener el resource completo a partir del id
const resource = ref({});
resource.value = await $fetch('/api/objeto', {
  method: 'POST',
  body: { id: objetoId.value.pk },
});

// TODO: actualizar varios metadatos al mismo tiempo
const { data } = useAuth();
async function actualizaMetadatos() {
  await $fetch('/api/metadatos', {
    method: 'POST',
    body: {
      pk: resource.value.pk,
      resource_type: resource.value.resource_type,
      abstract: campoResumen.value,
      token: data.value?.accessToken,
    },
  });
}

const dragNdDrop = ref(null);

async function guardarImagen(files) {
  if (
    files[0].name.split('.')[1] === '.jpg' ||
    files[0].name.endsWith('.jpg') ||
    files[0].name.split('.')[1] === '.jpeg' ||
    files[0].name.endsWith('.jpeg') ||
    files[0].type === 'image/jpeg' ||
    files[0].name.split('.')[1] === '.png' ||
    files[0].name.endsWith('.png') ||
    files[0].type === 'image/png'
  ) {
    imagen.value = files;
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
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
          <h2>{{ resource.title }}</h2>
          <div class="flex">
            <nuxt-link
              :class="`${route.path === '/catalogo/mis-archivos/editar-metadatos' ? 'borde-enlace-activo' : ''}`"
              to="/catalogo/mis-archivos/editar-metadatos"
              >Metadatos</nuxt-link
            >
            <nuxt-link
              :class="`${route.path === '/catalogo/mis-archivos/editar-estilo' ? 'borde-enlace-activo' : ''}`"
              to="/catalogo/mis-archivos/editar-estilo"
              style=""
              >Estilo</nuxt-link
            >
          </div>
          <div class="borde-b borde-color-secundario"></div>
          <h2>Metadatos</h2>
          <div style="display: flex; gap: 4px">
            <div
              class="borde borde-grosor-2"
              style="width: 25%; border-color: var(--color-primario-1)"
            ></div>
            <div
              class="borde borde-grosor-2"
              style="width: 25%; border-color: var(--color-neutro-2)"
            ></div>
            <div
              class="borde borde-grosor-2"
              style="width: 25%; border-color: var(--color-neutro-2)"
            ></div>
            <div
              class="borde borde-grosor-2"
              style="width: 25%; border-color: var(--color-neutro-2)"
            ></div>
          </div>
          <ol>
            <li>Metadatos básicos</li>
          </ol>
          <p>
            <b>Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG</b>
          </p>

          <!-- Drag & Drop -->
          <ClientOnly>
            <CatalogoElementoDragNdDrop ref="dragNdDrop" @pasar-archivo="(i) => guardarImagen(i)" />
          </ClientOnly>

          <!-- Formulario -->
          <div class="m-t-3">
            <div class="flex">
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoTitulo"
                    etiqueta="Título"
                    ejemplo="Añade un nombre"
                  />
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoResumen"
                    etiqueta="Resumen"
                    ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
                  />
                </ClientOnly>
              </div>
              <div class="columna-8">
                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionEjemplo"
                    etiqueta="Tipo de fecha"
                    texto_ayuda="Creación, publicación o revisión."
                  >
                    <option value="1">Creación</option>
                    <option value="2">Publicación</option>
                    <option value="3">Revisón</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
              <div class="columna-8">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="seleccionFecha"
                    etiqueta="Fecha"
                    ejemplo="tipo date"
                    tipo="date"
                    texto_ayuda="aaaa-mm-dd"
                  />
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiSelector v-model="seleccionCategoria" etiqueta="Categoría">
                    <option value="1">Opcion Uno</option>
                    <option value="2">Opcion Dos</option>
                    <option value="3">Opcion Tres</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionGrupo"
                    etiqueta="Selecciona al grupo con el que compartirás tu archivo"
                  >
                    <option value="1">Opcion Uno</option>
                    <option value="2">Opcion Dos</option>
                    <option value="3">Opcion Tres</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoPalabrasClave"
                    etiqueta="Palabras clave"
                    ejemplo="Agua, educación, conservación..."
                  />
                </ClientOnly>
              </div>
              <div class="columna-8">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoAutor"
                    etiqueta="Autor"
                    ejemplo="Añade nombre de autor"
                  />
                </ClientOnly>
              </div>
              <div class="columna-8">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoAnioPublicacion"
                    etiqueta="Año de publicación"
                    ejemplo="Ej. 2002"
                  />
                </ClientOnly>
              </div>
            </div>
            <div class="flex p-t-3">
              <nuxt-link
                class="boton-secundario boton-chico"
                type="button"
                to="/catalogo/mis-archivos"
                >Ir a mis archivos</nuxt-link
              >
              <button
                class="boton-primario boton-chico"
                :disabled="false"
                @click="actualizaMetadatos()"
              >
                Actualizar
              </button>
              <button class="boton-primario boton-chico" :disabled="false">Siguiente</button>
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
