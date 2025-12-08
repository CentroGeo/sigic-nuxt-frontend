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

const previousPath = computed(() => storeCatalogo.previousPath || '');

const isDocumentoReading = ref(false);

const modalAceptar = ref(null);
const modalNoAceptar = ref(null);
const modalAgregar = ref(null);

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

async function agregarAMisSolicitudes() {
  try {
    // petición para agregar la solicitud a Mis revisiones
    const response = await $fetch(`${configEnv.public.basePath}/api/solicitudes`, {
      method: 'POST',
      body: {
        pk: selectedPk,
        token: token,
        status: 'on_review',
        rejection_reason: 'En revisión.', // no se puede quedar vacío ''
      },
    });
    console.warn(response);
    modalAgregar.value.cerrarModal();
    await navigateTo('/catalogo/revision-solicitudes/mis-revisiones');
  } catch (error) {
    console.error(error);
  }
}

const rutaBoton = ref('');
const textoBoton = ref('');
const baseUrl = '/catalogo/revision-solicitudes';
/**
 * Asigna el texto y la ruta del botón de regresar
 * dependiendo de la ruta anterior
 */
function asignaBotonRegresar() {
  if (previousPath.value === `${baseUrl}/mis-revisiones`) {
    rutaBoton.value = `${baseUrl}/mis-revisiones`;
    textoBoton.value = 'Mis revisiones';
  } else {
    if (previousPath.value === `${baseUrl}/pendientes-revisor`) {
      rutaBoton.value = `${baseUrl}/pendientes-revisor`;
      textoBoton.value = 'Revisión de solicitudes';
    } else {
      rutaBoton.value = `${baseUrl}/no-aceptadas`;
      textoBoton.value = 'No aceptadas';
    }
  }
}

onMounted(() => {
  asignaBotonRegresar();
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-4">
        <div class="flex flex-contenido-separado m-b-3">
          <nuxt-link :to="rutaBoton" :aria-label="`Regresar a ${textoBoton}`">
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento m-r-2"
              aria-hidden="true"
            />
            <span class="h5 texto-color-primario">{{ textoBoton }}</span>
          </nuxt-link>

          <div v-if="previousPath === `${baseUrl}/mis-revisiones`" class="flex">
            <button type="button" @click="modalAceptar.abrirModal()">
              Aceptar<span class="pictograma-aprobado" aria-hidden="true" />
            </button>
            <button type="button" @click="modalNoAceptar.abrirModal()">
              Rechazar<span class="pictograma-cerrar" aria-hidden="true" />
            </button>
          </div>

          <div v-if="previousPath === `${baseUrl}/pendientes-revisor`" class="flex">
            <button class="boton-primario" type="button" @click="modalAgregar.abrirModal()">
              Agregar a mis revisiones<span class="pictograma-agregar" aria-hidden="true" />
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
        <!-- Modal Agregar a Mis revisiones -->
        <SisdaiModal ref="modalAgregar">
          <template #encabezado> <h2>Agregar a mi revisión</h2> </template>
          <template #cuerpo>
            <p>
              ¿Deseas añadir este documento a tu revisión? Al hacerlo, quedará reservado para ti y
              no podrá ser revisado por otras personas hasta que lo liberes o completes el proceso.
            </p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalAgregar.cerrarModal()"
            >
              Cancelar
            </button>
            <button
              class="boton-primario boton-chico"
              type="button"
              @click="agregarAMisSolicitudes"
            >
              Añadir a mi revisión
            </button>
          </template>
        </SisdaiModal>

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
