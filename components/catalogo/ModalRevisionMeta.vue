<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { categoriesInSpanish } from '~/utils/consulta';
const props = defineProps({
  reviewPk: {
    type: String,
    default: null,
  },
  resourceType: {
    type: String,
    default: null,
  },
});

const config = useRuntimeConfig();
const { gnoxyFetch } = useGnoxyUrl();
const isLoading = ref(false);
const resource = ref(null);

const dateTypeDict = {
  creation: 'Creación',
  publication: 'Publicación',
  revision: 'Revision',
};

const modalRevisionBasicos = ref(null);
const modalRevisionLicencias = ref(null);
const modalRevisionOpcionales = ref(null);
const modalRevisionAtributos = ref(null);

async function fetchResource() {
  isLoading.value = true;
  const type = props.resourceType === 'documents' ? 'document' : 'dataset';
  const url = `${config.public.geonodeApi}/${props.resourceType}/${props.reviewPk}`;
  const request = await gnoxyFetch(url);
  const res = await request.json();
  resource.value = res[type];
  console.log(resource.value);
  isLoading.value = false;
}

function getKeywords() {
  const keywords = resource.value.keywords.map((d) => d.name);
  return keywords.join(', ');
}

function abrirModalRevision() {
  modalRevisionBasicos.value?.abrirModal();
}
defineExpose({
  abrirModalRevision,
});

onMounted(async () => {
  fetchResource();
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalRevisionBasicos">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <!--Spinner-->
      <template v-if="isLoading" #cuerpo>
        <div class="flex flex-contenido-centrado">
          <figure>
            <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
            <figcaption class="texto-centrado">Obteniendo Metadatos</figcaption>
          </figure>
        </div>
      </template>

      <!--Cuerpo de metadatos básicos-->
      <template v-else #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Metadatos básicos'"
          :exclude-links="true"
        />

        <div class="flex" style="gap: 0 24px">
          <div class="m-b-2 columna-16">
            <label class="m-0">Titulo</label>
            <p class="m-0">
              {{ resource.title }}
            </p>
          </div>
          <div class="m-b-2 columna-16">
            <label class="m-0">Resumen</label>
            <p class="m-0">
              {{ resource.abstract }}
            </p>
          </div>
          <div class="m-b-2 columna-8">
            <label class="m-0">Tipo de fecha</label>
            <p class="m-0">
              {{ dateTypeDict[resource.date_type] }}
            </p>
          </div>
          <div class="m-b-2 columna-8">
            <label class="m-0">Fecha</label>
            <p class="m-0">
              {{ resource.date }}
            </p>
          </div>
          <div class="m-b-2 columna-16">
            <label class="m-0">Categoría</label>
            <p class="m-0">
              {{ categoriesInSpanish[resource.category.gn_description] }}
            </p>
          </div>
          <div class="m-b-2 columna-16">
            <label class="m-0">Palabras clave</label>
            <p class="m-0">
              {{ getKeywords() }}
            </p>
          </div>
        </div>
      </template>
      <!--Botones-->
      <template v-if="!isLoading" #pie>
        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8">
            <button
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="
                modalRevisionBasicos.cerrarModal();
                modalRevisionLicencias.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal v-if="!isLoading" ref="modalRevisionLicencias">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>

      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Ubicación y Licencias'"
          :exclude-links="true"
        />

        <!--Cuerpo de metadatos básicos-->
      </template>
      <template #pie>
        <!--Botones-->
        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              aria-label="Regresar"
              @click="
                modalRevisionLicencias.cerrarModal();
                modalRevisionBasicos.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div class="columna-8">
            <button
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="
                modalRevisionLicencias.cerrarModal();
                modalRevisionOpcionales.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal v-if="!isLoading" ref="modalRevisionOpcionales">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>

      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Metadatos Opcionales'"
          :exclude-links="true"
        />

        <!--Cuerpo de metadatos básicos-->
      </template>
      <template #pie>
        <!--Botones-->
        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              aria-label="Regresar"
              @click="
                modalRevisionOpcionales.cerrarModal();
                modalRevisionLicencias.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div v-if="props.resourceType !== 'documents'" class="columna-8">
            <button
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="
                modalRevisionOpcionales.cerrarModal();
                modalRevisionAtributos.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
          <div v-else class="columna-8">
            <button
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="modalRevisionOpcionales.cerrarModal()"
            >
              Cerrar
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal v-if="!isLoading" ref="modalRevisionAtributos">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>

      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Atributos del Conjunto de Datos'"
          :exclude-links="true"
        />

        <!--Cuerpo de metadatos básicos-->
      </template>
      <template #pie>
        <!--Botones-->
        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              aria-label="Regresar"
              @click="
                modalRevisionAtributos.cerrarModal();
                modalRevisionOpcionales.abrirModal();
              "
            >
              Regresar
            </button>
          </div>

          <div class="columna-8">
            <button
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="modalRevisionAtributos.cerrarModal()"
            >
              Cerrar
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
