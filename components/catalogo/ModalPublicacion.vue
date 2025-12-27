<script setup>
import {
  downloadDocs,
  downloadMetadata,
  downloadNoGeometry,
  downloadRaster,
  downloadWMS,
} from '@/utils/consulta';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { findServer } from '~/utils/consulta';

const props = defineProps({
  resourceType: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceType, selectedElement } = toRefs(props);
const { gnoxyFetch } = useGnoxyUrl();
const seleccionVarDisponibles = ref(selectedElement.value.default_style);
const hasAttrTable = computed(() => {
  if (selectedElement.value.sourcetype === 'REMOTE' || resourceType.value === 'document') {
    return false;
  } else {
    return true;
  }
});
const extentMap = ref(undefined);
const modalMapaPreview = ref(null);
const modalMetaBasicos = ref(null);
const modalMetaLicencias = ref(null);
const modalMetaOpcionales = ref(null);
const modalMetaAtributos = ref(null);
const optionsList = ref(null);
const selectedOption = ref();
const tagTitle = ref();
const docExtension = ref(
  resourceType.value === 'document'
    ? selectedElement.value.links.find((link) => link.link_type === 'uploaded').extension
    : 'No aplica'
);
const layerType = ref(
  resourceType.value === 'dataLayer' ? selectedElement.value.subtype : 'No aplica'
);
function abrirmodalPublicacion() {
  if (resourceType.value === 'dataLayer') {
    modalMapaPreview.value?.abrirModal();
  } else {
    modalMetaBasicos.value?.abrirModal();
  }
  optionsList.value = optionsDict[resourceType.value]['elements'];
  tagTitle.value = optionsDict[resourceType.value]['title'];
  selectedOption.value = optionsList.value.map((d) => d.label)[0];
}

const layerOptions = {
  raster: [
    {
      label: 'GeoTiff',
      action: () => {
        downloadRaster(selectedElement.value);
      },
    },
    {
      label: 'Metadatos',
      action: () => {
        downloadMetadata(selectedElement.value);
      },
    },
  ],
  vector: [
    {
      label: 'GeoJson',
      action: () => {
        downloadWMS(selectedElement.value, 'geojson', 'all');
      },
    },
    {
      label: 'CSV',
      action: () => {
        downloadWMS(selectedElement.value, 'csv', 'all');
      },
    },
    {
      label: 'GeoPackage',
      action: () => {
        downloadWMS(selectedElement.value, 'gpkg', 'all');
      },
    },
    {
      label: 'KML',
      action: () => {
        downloadWMS(selectedElement.value, 'kml', 'all');
      },
    },
    {
      label: 'Metadatos',
      action: () => {
        downloadMetadata(selectedElement.value);
      },
    },
  ],
  remote: [],
};
const optionsDict = {
  dataLayer: {
    title: 'capa',
    elements: layerOptions[layerType.value],
  },
  dataTable: {
    title: 'archivo',
    elements: [
      {
        label: 'CSV',
        action: () => {
          downloadNoGeometry(selectedElement.value, 'csv');
        },
      },
      {
        label: 'XLS',
        action: () => {
          downloadNoGeometry(selectedElement.value, 'xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadNoGeometry(selectedElement.value, 'xlsx');
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadMetadata(selectedElement.value);
        },
      },
    ],
  },
  document: {
    title: 'documento',
    elements: [
      {
        label: docExtension.value === 'pdf' ? 'PDF' : 'TXT',
        action: () => {
          downloadDocs(selectedElement.value);
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadMetadata(selectedElement.value);
        },
      },
    ],
  },
};

function confirmarSolicitud(cerrarModal) {
  if (cerrarModal === 'modalMetaOpcionales') {
    modalMetaOpcionales.value.cerrarModal();
  } else {
    modalMetaAtributos.value.cerrarModal();
  }
  console.warn('confirmada');
  navigateTo({
    path: '/catalogo/mis-archivos/solicitudes-publicacion',
  });
}

defineExpose({
  abrirmodalPublicacion,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalMapaPreview">
      <template #encabezado>
        <p class="m-t-0 m-b-1" style="color: transparent">a</p>
        <div
          class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1"
        >
          <strong class="m-0 texto-peso-600">Verifica antes de publicar</strong>
          <p class="m-0">
            Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación
            para ser publicado en el Catálogo de SIGIC público.
          </p>
        </div>
        <h1 class="m-t-3">{{ selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <div class="modal-alto-cuerpo">
          <div v-if="tagTitle === 'capa'">
            <ClientOnly>
              <SisdaiSelector
                v-if="selectedElement.styles.length > 1"
                v-model="seleccionVarDisponibles"
                class="m-b-1"
                etiqueta="Variables disponibles para visualizar"
              >
                <option
                  v-for="style in selectedElement.styles"
                  :key="`${style}-estilo`"
                  :value="style"
                >
                  {{ style }}
                </option>
              </SisdaiSelector>
            </ClientOnly>

            <SisdaiMapa class="gema" :vista="{ extension: extentMap }">
              <SisdaiCapaXyz />

              <SisdaiCapaWms
                :estilo="seleccionVarDisponibles"
                :capa="selectedElement.alternate"
                :consulta="gnoxyFetch"
                :fuente="findServer(selectedElement)"
                @al-finalizar-carga="extentMap = selectedElement.extent.coords"
              />
            </SisdaiMapa>
          </div>

          <div class="flex flex-contenido-separado m-t-3">
            <div class="columna-8 texto-centrado">
              <button
                type="button"
                aria-label="Cancelar"
                class="boton-secundario"
                @click="modalMapaPreview.cerrarModal()"
              >
                Cancelar
              </button>
            </div>
            <div class="columna-8">
              <button
                type="button"
                aria-label="Siguiente"
                class="boton-primario texto-centrado"
                @click="
                  modalMapaPreview.cerrarModal();
                  modalMetaBasicos.abrirModal();
                "
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalMetaBasicos">
      <template #encabezado>
        <p class="m-t-0 m-b-1" style="color: transparent">a</p>
        <div
          class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1"
        >
          <strong class="m-0 texto-peso-600">Verifica antes de publicar</strong>
          <p class="m-0">
            Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación
            para ser publicado en el Catálogo de SIGIC público.
          </p>
        </div>
      </template>

      <template #cuerpo>
        <CatalogoBasicosMeta
          :recurso="selectedElement"
          :resource-pk="selectedElement.pk"
          :resource-type="resourceType"
          :is-modal="true"
        />

        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              aria-label="Regresar"
              class="boton-secundario"
              @click="
                modalMetaBasicos.cerrarModal();
                modalMapaPreview.abrirModal();
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
                modalMetaBasicos.cerrarModal();
                modalMetaLicencias.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalMetaLicencias">
      <template #encabezado>
        <p class="m-t-0 m-b-1" style="color: transparent">a</p>
        <div
          class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1"
        >
          <strong class="m-0 texto-peso-600">Verifica antes de publicar</strong>
          <p class="m-0">
            Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación
            para ser publicado en el Catálogo de SIGIC público.
          </p>
        </div>
      </template>

      <template #cuerpo>
        <CatalogoUbicacionMeta
          :recurso="selectedElement"
          :resource-pk="selectedElement.pk"
          :resource-type="resourceType"
          :is-modal="true"
        />

        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              aria-label="Regresar"
              @click="
                modalMetaLicencias.cerrarModal();
                modalMetaBasicos.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div class="columna-8">
            <button
              type="button"
              aria-label="Siguiente"
              class="boton-primario texto-centrado"
              @click="
                modalMetaLicencias.cerrarModal();
                modalMetaOpcionales.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalMetaOpcionales">
      <template #encabezado>
        <p class="m-t-0 m-b-1" style="color: transparent">a</p>
        <div
          class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1"
        >
          <strong class="m-0 texto-peso-600">Verifica antes de publicar</strong>
          <p class="m-0">
            Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación
            para ser publicado en el Catálogo de SIGIC público.
          </p>
        </div>
      </template>
      <template #cuerpo>
        <CatalogoOpcionalesMeta
          :recurso="selectedElement"
          :resource-pk="selectedElement.pk"
          :resource-type="resourceType"
          :is-modal="true"
        />

        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              aria-label="Regresar"
              class="boton-secundario"
              @click="
                modalMetaOpcionales.cerrarModal();
                modalMetaLicencias.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div class="columna-8">
            <!--v-if="tagTitle !== 'capa'"-->
            <button
              v-if="!hasAttrTable"
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="confirmarSolicitud('modalMetaOpcionales')"
            >
              Confirmar
            </button>
            <!-- TODO: revisar la parte de capa con geometría y subtipo con vector -->
            <!--v-if="tagTitle == 'capa'"-->
            <button
              v-if="hasAttrTable"
              type="button"
              aria-label="Siguiente"
              class="boton-primario texto-centrado"
              @click="
                modalMetaOpcionales.cerrarModal();
                modalMetaAtributos.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalMetaAtributos">
      <template #encabezado>
        <p class="m-t-0 m-b-1" style="color: transparent">a</p>
        <div
          class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1"
        >
          <strong class="m-0 texto-peso-600">Verifica antes de publicar</strong>
          <p class="m-0">
            Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación
            para ser publicado en el Catálogo de SIGIC público.
          </p>
        </div>
      </template>
      <template #cuerpo>
        <CatalogoAtributosMeta
          :recurso="selectedElement"
          :resource-pk="selectedElement.pk"
          :resource-type="resourceType"
          :is-modal="true"
        />

        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              @click="
                modalMetaAtributos.cerrarModal();
                modalMetaOpcionales.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div class="columna-8">
            <button
              type="button"
              aria-label="Confirmar"
              class="boton-primario texto-centrado"
              @click="confirmarSolicitud('modalMetaAtributos')"
            >
              Confirmar
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.modal-alto-cuerpo {
  max-height: 320px;
}
.boton-secundario,
.boton-primario {
  width: 100%;
  display: inherit;
}
</style>
