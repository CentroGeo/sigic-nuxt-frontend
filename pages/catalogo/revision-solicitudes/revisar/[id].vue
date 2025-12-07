<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

definePageMeta({
  middleware: 'auth',
});
const storeCatalogo = useCatalogoStore();

// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.pk;
const previousPath = route.query.previous_path;

const isDocumentoReading = ref(false);

const modalAceptar = ref(null);
const modalNoAceptar = ref(null);

const areaMensajeAceptar = ref('');
const areaMensajeNoAceptar = ref('');

const { data } = useAuth();
const token = data.value?.accessToken;
const configEnv = useRuntimeConfig();

async function aceptarSolicitud() {
  try {
    // petición para aceptar y publicar la solicitud del recurso
    const response = await $fetch(`${configEnv.public.basePath}/api/solicitudes`, {
      method: 'POST',
      body: {
        pk: selectedPk,
        token: token,
        status: 'published',
        rejection_reason:
          areaMensajeAceptar.value === '' ? 'Sin comentarios' : areaMensajeAceptar.value,
      },
    });
    console.warn(response);
    modalAceptar.value.cerrarModal();
    await navigateTo('/catalogo/revision-solicitudes/aceptadas');
  } catch (error) {
    console.error(error);
  }
}

async function noAceptarSolicitud() {
  try {
    // petición para no aceptar y rechazar la solicitud del recurso
    const response = await $fetch(`${configEnv.public.basePath}/api/solicitudes`, {
      method: 'POST',
      body: {
        pk: selectedPk,
        token: token,
        status: 'rejected',
        rejection_reason: areaMensajeNoAceptar.value,
      },
    });
    console.warn(response);
    modalNoAceptar.value.cerrarModal();
    await navigateTo('/catalogo/revision-solicitudes/no-aceptadas');
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-4">
        <div class="flex flex-contenido-separado m-b-3">
          <nuxt-link
            :to="
              previousPath === '/catalogo/revision-solicitudes/mis-revisiones'
                ? '/catalogo/revision-solicitudes/mis-revisiones'
                : previousPath === '/catalogo/revision-solicitudes'
                  ? '/catalogo/revision-solicitudes'
                  : '/catalogo/revision-solicitudes/no-aceptadas'
            "
            aria-label="Regresar a aportes"
          >
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento m-r-2"
              aria-hidden="true"
            />
            <span class="h5 texto-color-primario">{{
              previousPath === '/catalogo/revision-solicitudes/mis-revisiones'
                ? 'Mis revisiones'
                : previousPath === '/catalogo/revision-solicitudes'
                  ? 'Revisión de solicitudes'
                  : 'No aceptadas'
            }}</span>
          </nuxt-link>

          <div v-if="previousPath === '/catalogo/revision-solicitudes/mis-revisiones'" class="flex">
            <button type="button" @click="modalAceptar.abrirModal()">
              Aceptar<span class="pictograma-aprobado" aria-hidden="true" />
            </button>
            <button type="button" @click="modalNoAceptar.abrirModal()">
              Rechazar<span class="pictograma-cerrar" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div v-if="!isDocumentoReading" class="flex flex-contenido-centrado">
          <figure>
            <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
            <figcaption class="texto-centrado">Cargando documento</figcaption>
          </figure>
        </div>
        <CatalogoDocRevision
          :selected-element-pk="selectedPk"
          @doc-cargado="isDocumentoReading = true"
        />
      </main>

      <ClientOnly>
        <!-- Modal Aceptar -->
        <SisdaiModal ref="modalAceptar">
          <template #encabezado> <h2>Aceptar solicitud</h2> </template>
          <template #cuerpo>
            <SisdaiAreaTexto
              v-model="areaMensajeAceptar"
              etiqueta="Mensaje (opcional)"
              ejemplo="Escribe un mensaje"
              :es_obligatorio="false"
              :es_etiqueta_visible="true"
            />
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalAceptar.cerrarModal()"
            >
              Cerrar
            </button>
            <button class="boton-primario boton-chico" type="button" @click="aceptarSolicitud">
              Enviar
            </button>
          </template>
        </SisdaiModal>

        <!-- Modal No aceptar -->
        <SisdaiModal ref="modalNoAceptar">
          <template #encabezado> <h2>No aceptar solicitud</h2> </template>
          <template #cuerpo>
            <SisdaiAreaTexto
              v-model="areaMensajeNoAceptar"
              etiqueta="Mensaje"
              ejemplo="Escribe un mensaje"
              :es_obligatorio="true"
              :es_etiqueta_visible="true"
            />
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalNoAceptar.cerrarModal()"
            >
              Cerrar
            </button>
            <button
              class="boton-primario boton-chico"
              type="button"
              :disabled="areaMensajeNoAceptar === ''"
              @click="noAceptarSolicitud"
            >
              Enviar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
