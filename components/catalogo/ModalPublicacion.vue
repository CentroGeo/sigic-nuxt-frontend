<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

const props = defineProps({
  resourceType: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceType, selectedElement } = toRefs(props);

const seleccionVarDisponibles = ref(selectedElement.value.alternate);
const config = useRuntimeConfig();
const extentMap = ref(undefined);

const modalPublica = ref(null);
const modalPublicaBasicos = ref(null);
const modalPublicaUbicacion = ref(null);
const modalPublicaOpcionales = ref(null);
const modalPublicaAtributos = ref(null);

const tagTitle = ref();

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

function abrirModalDescarga() {
  modalPublica.value?.abrirModal();
  tagTitle.value = optionsDict[resourceType.value]['title'];
}

/**
 * Confirma la solicitud de publicación, cierra los modales, realiza la
 * petición al endpoint de sigic/requests y navega a las solicitudes
 * @param {String} cerrarModal  la opción del modal a cerrar
 */
async function confirmarSolicitud(cerrarModal) {
  if (cerrarModal === 'modalPublicaOpcionales') {
    modalPublicaOpcionales.value.cerrarModal();
  } else {
    modalPublicaAtributos.value.cerrarModal();
  }
  const id = selectedElement.value.pk;
  console.warn(`solicitud ${id} confirmada`);

  try {
    const { data } = useAuth();
    const token = data.value?.accessToken;
    const configEnv = useRuntimeConfig();
    const baseUrl = configEnv.public.geonodeUrl;
    // const baseUrl = 'http://10.2.102.177';
    const headers = ref({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

    // petición para enviar el recurso a la solicitud
    await fetch(`${baseUrl}/sigic/requests/`, {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify({ resource_pk: id }),
    });

    navigateTo({
      path: '/catalogo/mis-archivos/solicitudes-publicacion',
    });
  } catch (error) {
    console.error(error);
  }
}

defineExpose({
  abrirModalDescarga,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalPublica" class="modal-grande">
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
                v-model="seleccionVarDisponibles"
                class="m-b-1"
                style="display: none"
                etiqueta="Variables disponibles para visualizar"
              >
                <option value="1">variable</option>
              </SisdaiSelector>
            </ClientOnly>

            <SisdaiMapa class="gema" :vista="{ extension: extentMap }">
              <SisdaiCapaXyz />

              <SisdaiCapaWms
                :capa="selectedElement.alternate"
                :fuente="`${config.public.geoserverUrl}/wms?`"
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
                @click="modalDescarga.cerrarModal()"
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
                  modalPublica.cerrarModal();
                  modalPublicaBasicos.abrirModal();
                "
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalPublicaBasicos" class="modal-grande">
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
                modalPublicaBasicos.cerrarModal();
                modalPublica.abrirModal();
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
                modalPublicaBasicos.cerrarModal();
                modalPublicaUbicacion.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalPublicaUbicacion" class="modal-grande">
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
                modalPublicaUbicacion.cerrarModal();
                modalPublicaBasicos.abrirModal();
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
                modalPublicaUbicacion.cerrarModal();
                modalPublicaOpcionales.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalPublicaOpcionales" class="modal-grande">
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
                modalPublicaOpcionales.cerrarModal();
                modalPublicaUbicacion.abrirModal();
              "
            >
              Regresar
            </button>
          </div>
          <div class="columna-8">
            <button
              v-if="tagTitle !== 'capa'"
              aria-label="Siguiente"
              type="button"
              class="boton-primario texto-centrado"
              @click="confirmarSolicitud('modalPublicaOpcionales')"
            >
              Confirmar
            </button>
            <!-- TODO: revisar la parte de capa con geometría y subtipo con vector -->
            <button
              v-if="tagTitle === 'capa'"
              type="button"
              aria-label="Siguiente"
              class="boton-primario texto-centrado"
              @click="
                modalPublicaOpcionales.cerrarModal();
                modalPublicaAtributos.abrirModal();
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="modalPublicaAtributos" class="modal-grande">
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
                modalPublicaAtributos.cerrarModal();
                modalPublicaOpcionales.abrirModal();
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
              @click="confirmarSolicitud('modalPublicaAtributos')"
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
.boton-secundario,
.boton-primario {
  width: 100%;
  display: inherit;
}
</style>
