<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
const typeDict = {
  Documentos: 'document',
  'Capa geográfica': 'dataLayer',
  'Datos tabulados': 'dataTable',
};
// Recuperamos la información completa del recurso
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(typeDict[type]);
const resources = computed(() => storeFetched.byResourceType(typeDict[type]));
const editedResource = computed(() => resources.value.find(({ pk }) => pk === selectedPk));

//const imagen = ref();
const campoResumen = ref('Resumen desde sigic');
const campoTitulo = ref('');
const campoPalabrasClave = ref('');
const campoAutor = ref('');
const campoAnioPublicacion = ref('');
const seleccionEjemplo = ref('');
const seleccionFecha = ref('');
const seleccionCategoria = ref('');
const seleccionGrupo = ref('');
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource" id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <CatalogoHeaderMetadatos
            :resource="editedResource"
            :title="'Metadatos básicos'"
          ></CatalogoHeaderMetadatos>

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
            <CatalogoBotonesMetadatos
              :title="'MetadatosBasicos'"
              :pk="selectedPk"
              :tipo="type"
              :resource="editedResource"
            ></CatalogoBotonesMetadatos>
          </div>
        </div>
      </main>

      <main v-else>
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style></style>
