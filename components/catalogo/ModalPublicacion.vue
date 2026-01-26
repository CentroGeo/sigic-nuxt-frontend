<script setup>
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

// const modalPublica = ref(null);
// const modalPublicaBasicos = ref(null);
// const modalPublicaUbicacion = ref(null);
// const modalPublicaOpcionales = ref(null);
// const modalPublicaAtributos = ref(null);
const modalPublicaConfirmar = ref(null);

// const tagTitle = ref();
//
const modalMapaPreview = ref(null);
const modalMetaBasicos = ref(null);
const modalMetaLicencias = ref(null);
const modalMetaOpcionales = ref(null);
const modalMetaAtributos = ref(null);
const optionsList = ref(null);
// const selectedOption = ref();
const tagTitle = ref();
// const docExtension = ref(
//   resourceType.value === 'document'
//     ? selectedElement.value.links.find((link) => link.link_type === 'uploaded').extension
//     : 'No aplica'
// );
// const layerType = ref(
//   resourceType.value === 'dataLayer' ? selectedElement.value.subtype : 'No aplica'
// );
function abrirmodalPublicacion() {
  if (resourceType.value === 'dataLayer') {
    modalMapaPreview.value?.abrirModal();
  } else {
    modalMetaBasicos.value?.abrirModal();
  }
  optionsList.value = optionsDict[resourceType.value]['elements'];
  tagTitle.value = optionsDict[resourceType.value]['title'];
  // selectedOption.value = optionsList.value.map((d) => d.label)[0];
}

const alertaModal = {
  titulo: 'Verifica antes de publicar',
  contenido:
    'Revisa que el documento y sus metadatos sean correctos antes de enviarlo a aprobación para ser publicado en el Catálogo de SIGIC público.',
  css: 'texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-1',
};

const optionsDict = {
  dataLayer: {
    title: 'capa',
  },
  dataTable: {
    title: 'archivo',
  },
  document: {
    title: 'documento',
  },
};

// function abrirModalDescarga() {
//   modalPublica.value?.abrirModal();
//   tagTitle.value = optionsDict[resourceType.value]['title'];
// }

const estatus = ref(true);
/**
 * Confirma la solicitud de publicación, cierra los modales, realiza la
 * petición al endpoint de sigic/requests y navega a las solicitudes
 * @param {String} cerrarModal  la opción del modal a cerrar
 */
async function confirmarSolicitud(cerrarModal) {
  //   function confirmarSolicitud(cerrarModal) {
  //   if (cerrarModal === 'modalMetaOpcionales') {
  //     modalMetaOpcionales.value.cerrarModal();
  //   } else {
  //     modalMetaAtributos.value.cerrarModal();
  // >>>>>>> develop
  //   }
  // }
  if (cerrarModal === 'modalMetaOpcionales') {
    modalMetaOpcionales.value.cerrarModal();
  } else {
    modalMetaAtributos.value.cerrarModal();
  }
  const id = selectedElement.value.pk;
  console.warn(`solicitud ${id} confirmada`);

  try {
    const { data } = useAuth();
    const token = data.value?.accessToken;
    const config = useRuntimeConfig();
    // petición para enviar el recurso a la solicitud
    const response = await $fetch(`${config.public.basePath}/api/requests`, {
      method: 'POST',
      headers: { token: token },
      body: {
        resource_pk: id, // id del recurso a solicitud
      },
    });
    console.warn('response', response);

    // const configEnv = useRuntimeConfig();
    // const baseUrl = configEnv.public.geonodeUrl;
    // const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

    // // petición para enviar el recurso a la solicitud
    // const response = await fetch(`${baseUrl}/sigic/requests/`, {
    //   method: 'POST',
    //   headers: headers.value,
    //   body: JSON.stringify({ resource_pk: id }),
    // });
    estatus.value = response.success ? true : false;
    modalPublicaConfirmar.value.abrirModal();
  } catch (error) {
    console.error('error', error);
  }
}

defineExpose({
  abrirmodalPublicacion,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalMapaPreview" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div :class="alertaModal.css">
          <strong class="m-0 texto-peso-600">{{ alertaModal.titulo }}</strong>
          <p class="m-0">{{ alertaModal.contenido }}</p>
        </div>

        <h2 class="m-t-3">{{ selectedElement.title }}</h2>

        <div class="modal-alto-cuerpo">
          <div v-if="tagTitle === 'capa'">
            <ClientOnly>
              <SisdaiSelector
                v-if="selectedElement.styles.length > 1"
                v-model="seleccionVarDisponibles"
                class="m-b-1"
                style="display: none"
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

    <SisdaiModal ref="modalMetaBasicos" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div :class="alertaModal.css">
          <strong class="m-0 texto-peso-600">{{ alertaModal.titulo }}</strong>
          <p class="m-0">{{ alertaModal.contenido }}</p>
        </div>

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

    <SisdaiModal ref="modalMetaLicencias" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div :class="alertaModal.css">
          <strong class="m-0 texto-peso-600">{{ alertaModal.titulo }}</strong>
          <p class="m-0">{{ alertaModal.contenido }}</p>
        </div>

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

    <SisdaiModal ref="modalMetaOpcionales" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div :class="alertaModal.css">
          <strong class="m-0 texto-peso-600">{{ alertaModal.titulo }}</strong>
          <p class="m-0">{{ alertaModal.contenido }}</p>
        </div>

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
            <!--v-if="tagTitle !== 'capa'"
              aria-label="Confirmar"
              type="button"
              class="boton-primario texto-centrado"
              @click="confirmarSolicitud('modalPublicaOpcionales')"-->
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

    <SisdaiModal ref="modalMetaAtributos" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div :class="alertaModal.css">
          <strong class="m-0 texto-peso-600">{{ alertaModal.titulo }}</strong>
          <p class="m-0">{{ alertaModal.contenido }}</p>
        </div>

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

    <SisdaiModal ref="modalPublicaConfirmar" class="modal-grande">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <div v-if="estatus">
          <h2>Tu archivo ha sido enviado a verificación.</h2>
          <!-- <p class="m-0">
            Recibirás una notificación en tu correo electrónico cuando el proceso se complete.
          </p> -->
        </div>
        <div v-else>
          <h2>Tu archivo no ha sido enviado a verificación.</h2>
          <p class="m-0">
            Revisa que el documento y sus metadatos estén correctos o vuelve a intentarlo.
          </p>
        </div>

        <div
          class="p-b-3 p-x-3 borde borde-redondeado-16 m-y-3"
          :class="
            estatus
              ? 'fondo-color-confirmacion borde-color-confirmacion'
              : 'fondo-color-error borde-color-error'
          "
        >
          <div class="flex flex-contenido-separado">
            <p class="flex flex-vertical-centrado">{{ selectedElement.title }}</p>
            <div class="flex">
              <p class="borde borde-redondeado-8 p-1">.{{ selectedElement.title.split('.')[1] }}</p>
            </div>
          </div>

          <div :class="estatus ? 'texto-color-confirmacion' : 'texto-color-error'">
            <span :class="estatus ? 'pictograma-aprobado' : 'pictograma-alerta'" />
            <b v-if="estatus"
              >El archivo ha sido enviado exitosamente para su proceso de aprobación.</b
            >
            <b v-else>El archivo no se ha enviado para su proceso de aprobación.</b>
          </div>
        </div>

        <div class="flex flex-contenido-separado m-t-3">
          <div class="columna-8 texto-centrado">
            <button
              type="button"
              class="boton-secundario"
              @click="modalPublicaConfirmar.cerrarModal()"
            >
              Finalizar
            </button>
          </div>
          <div class="columna-8">
            <button
              type="button"
              aria-label="Ir a mis archivos"
              class="boton-primario texto-centrado"
              @click="
                navigateTo({
                  path: '/catalogo/mis-archivos/solicitudes-publicacion',
                })
              "
            >
              Ver Mis Solicitudes
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.boton-secundario,
.boton-primario {
  width: 100%;
  display: inherit;
}
</style>
