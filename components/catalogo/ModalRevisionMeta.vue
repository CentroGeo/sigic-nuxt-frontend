<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { dictIdiomas } from '~/utils/catalogo';
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
const resource = ref({});

const dateTypeDict = {
  creation: 'Creación',
  publication: 'Publicación',
  revision: 'Revision',
};

const dictLicencia = {
  not_specified: 'No especificado(a)',
  varied_original: 'Varios / Original',
  varied_derived: 'Varios / Derivados(as)',
  public_domain: 'Dominio público',
  public_domain_usg: 'Dominio público / Gobierno de EUA',
  odbl: 'Licencia abierta de bases de datos abiertos',
  nextview: 'NextView',
};

const modalRevisionBasicos = ref(null);
const modalRevisionLicencias = ref(null);
const modalRevisionOpcionales = ref(null);
const modalRevisionAtributos = ref(null);

function getKeywords(resourceKeywords) {
  const keywords = resourceKeywords.map((d) => d.name);
  return keywords.join(', ');
}

function findLanguage(language) {
  const languageDict = dictIdiomas.find((d) => Object.keys(d).includes(language));
  return languageDict[language];
}

async function fetchResource() {
  isLoading.value = true;
  const type = props.resourceType === 'documents' ? 'document' : 'dataset';
  const url = `${config.public.geonodeApi}/${props.resourceType}/${props.reviewPk}`;
  const request = await gnoxyFetch(url);
  const res = await request.json();
  const data = res[type];
  console.log(data);

  resource.value['title'] = data.title;
  resource.value['abstract'] = data.raw_abstract;
  resource.value['date_type'] = dateTypeDict[data.date_type];
  resource.value['date'] = data.date;
  resource.value['category'] = categoriesInSpanish[data.category.gn_description];
  resource.value['keywords'] = getKeywords(data.keywords);
  resource.value['language'] = findLanguage(data.language);
  resource.value['license'] = dictLicencia[data.license.identifier];
  resource.value['attribution'] = data.attribution;
  resource.value['data_quality_statement'] = data.raw_data_quality_statement;
  resource.value['restrictions'] = data.restriction_code_type.identifier;
  resource.value['constraints_others'] = data.raw_constraints_other;

  isLoading.value = false;
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
              {{ resource.date_type }}
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
              {{ resource.category }}
            </p>
          </div>
          <div class="m-b-2 columna-16">
            <label class="m-0">Palabras clave</label>
            <p class="m-0">
              {{ resource.keywords }}
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

      <!--Cuerpo de Ubicación y Licencias-->
      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Ubicación y Licencias'"
          :exclude-links="true"
        />

        <div class="m-t-3">
          <div class="flex">
            <div class="m-b-2 columna-8">
              <label class="m-0">Idioma</label>
              <p class="m-0">
                {{ resource.language }}
              </p>
            </div>
            <div class="m-b-2 columna-8">
              <label class="m-0">Licencia</label>
              <p class="m-0">
                {{ resource.license }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Autores o Institución</label>
              <p class="m-0">
                {{ resource.attribution }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Estado de Calidad de datos</label>
              <p class="m-0">
                {{ resource.data_quality_statement }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Resctricciones</label>
              <p class="m-0">
                {{ resource.restrictions }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Otras restricciones</label>
              <p class="m-0">
                {{ resource.constraints_other }}
              </p>
            </div>
          </div>
        </div>
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
