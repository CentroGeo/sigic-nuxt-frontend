<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  recurso: {
    type: Object,
    default: () => ({}),
  },
  resourcePk: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String,
    default: '',
  },
  isModal: {
    type: Boolean,
    default: false,
  },
});
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

const dragNdDrop = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
async function guardarImagen(files) {
  // solo una o la primera archivo de imagen
  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    imagen.value = files;
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
}
</script>
<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos básicos'"
      :exclude-links="props.isModal"
    ></CatalogoHeaderMetadatos>
    <div v-if="!props.isModal">
      <p>
        <b>Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG</b>
      </p>

      <!-- Drag & Drop -->
      <ClientOnly>
        <CatalogoElementoDragNdDrop ref="dragNdDrop" @pasar-archivo="(i) => guardarImagen(i)" />
      </ClientOnly>
    </div>

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex">
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase v-model="campoTitulo" etiqueta="Título" ejemplo="Añade un nombre" />
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
        :key="`1-${props.resourcePk}-buttons`"
        :resource="props.recurso"
        :title="'MetadatosBasicos'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      ></CatalogoBotonesMetadatos>
    </div>
  </div>
</template>
