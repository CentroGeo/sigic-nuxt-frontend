<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

const campoResumen = ref('Resumen desde sigic');
// const campoTitulo = ref('');
// const campoPalabrasClave = ref('');
// const campoAutor = ref('');
// const campoAnioPublicacion = ref('');
// const seleccionEjemplo = ref('');
// const seleccionCategoria = ref('');
// const seleccionGrupo = ref('');
// const ejemplo = ref({});

// const { data } = useAuth();

// async function patchData() {
//   const token = data.value?.accessToken;
//   const formData = new FormData();
//   formData.append('abstract', 'foo');
//   formData.append('token', token);
//   await fetch('/api/metadatos', { method: 'POST', body: formData });
// }

// console.log('index patch');
// fetch('https://jsonplaceholder.typicode.com/posts/1', {
//   method: 'PATCH',
//   body: JSON.stringify({
//     title: 'foo',
//   }),
//   headers: {
//     'Content-type': 'application/json; charset=UTF-8',
//   },
// })
//   .then((response) => response.json())
//   .then((json) => console.log('index patch', json));

// console.log('geonode');

// fetch('http://10.2.102.239/api/v2/datasets/1/', {
//   method: 'PATCH',
//   body: JSON.stringify({
//     abstract: 'foo',
//   }),
//   headers: {
//     'Content-type': 'application/json; charset=UTF-8',
//   },
// })
//   .then((response) => response.json())
//   .then((json) => console.log(json));
// fetch('/api/metadatos', {
//   method: 'POST',
// })
//   .then((response) => response.json())
//   .then((json) => console.log(json));
const { data } = useAuth();

async function actualizaMetadatos() {
  const token = ref(data.value?.accessToken);

  await $fetch('/api/metadatos', {
    method: 'POST',
    // body: { pk: '20', abstract: campoResumen.value, token: token.value },
    body: { pk: '22', abstract: campoResumen.value, token: token.value },
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
          <h2>nombre de la capa.json</h2>
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos/editar-metadatos" exact-path>Metadatos</nuxt-link>
            <nuxt-link to="/catalogo/mis-archivos/editar-estilo">Estilo</nuxt-link>
          </div>
          <h2>Metadatos</h2>
          <ol>
            <li>Metadatos básicos</li>
          </ol>
          <p>
            <b>Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG</b>
          </p>

          <!-- Drag & Drop -->
          <!-- <ClientOnly>
            <CatalogoElementoDragNdDrop />
          </ClientOnly> -->

          <!-- Formulario -->
          <div class="m-t-3">
            <!-- <div class="flex">
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoTitulo"
                    etiqueta="Título"
                    ejemplo="Añade un nombre"
                  />
                </ClientOnly>
              </div> -->
            <div class="columna-16">
              <ClientOnly>
                <SisdaiCampoBase
                  v-model="campoResumen"
                  etiqueta="Resumen"
                  ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
                />
              </ClientOnly>
            </div>
            <!-- <div class="columna-8">
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
                    v-model="ejemplo.fecha"
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
            </div> -->
            <div class="flex p-t-3">
              <button class="boton-secundario boton-chico" type="button">Ir a mis archivos</button>
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
