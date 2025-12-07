<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { categoriesInSpanish, resourceTypeDic, wait } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';
/**
 * @typedef {Object} Props
 * @property {Array} [variables=[]] - Indica las variables del encabezado thead tr th.
 * @property {Array} [datos=[]] - Indica los datos que coincida con las variables.
 * @property {caption} [caption=''] - Indica el título de la tabla.
 */
/** @type {Props} */
const props = defineProps({
  variables: { type: Array, default: Array },
  datos: { type: Array, default: Array },
  caption: {
    type: String,
    default: '',
  },
});
//const { data } = useAuth();
const idAleatorio = 'id-' + Math.random().toString(36).substring(2);
const shownModal = ref('ninguno');
const modalResource = ref(null);
const downloadOneChild = ref(null);
const releaseRequest = ref(null);
const resourceType = ref('');
const modalEliminar = ref(null);
const resourceToDeleteTitle = ref('');
const resourceToDeletePk = ref(null);
const isBeingDeleted = ref(false);
// diccionario para colocar acentos
const dictTable = ref({
  pk: 'pk',
  titulo: 'Título',
  tipo_recurso: 'Tipo de archivo',
  categoria: 'Categoría',
  actualizacion: 'Actualización',
  acciones: 'Acciones',
  estatus: 'Estatus',
  revisor: 'Revisor',
  propietario: 'Propietario',
});

/**
 * Codifica la propiedad pk de un objeto y se pasa como query al ir a otra vista
 * @param objeto que se va a codificar
 */

function irARutaConQuery(recurso) {
  const tipoRecurso =
    recurso.resource_type === 'document'
      ? 'document'
      : isGeometricExtension(recurso.extent)
        ? 'dataLayer'
        : 'dataTable';

  navigateTo({
    path: '/catalogo/mis-archivos/editar/MetadatosBasicos',
    query: { data: recurso.pk, type: tipoRecurso },
  });
  // evitar problemas con espacios con JSON.stingify
  //const pk = encodeURIComponent(JSON.stringify({ pk: objeto.pk }));
  /*   if (objeto.tipo_recurso === 'Capa geográfica') {
    navigateTo({
      path: '/catalogo/mis-archivos/editar-estilo',
      query: { data: pk },
    });*/
}

const revisando = ref(false);
async function openResourceReview(resource) {
  // console.log('resource.pk', resource.pk);
  if (resource.tipo_recurso === 'Documentos') {
    await navigateTo({
      path: `/catalogo/revision-solicitudes/revisar/${resource.pk}`,
      query: { pk: resource.pk, previous_path: resource.previous_path },
    });
    revisando.value = true;
  }
}

const modalAgregarMisRevisiones = ref(null);
const pkResource = ref();
/**
 * Abre el modal para agregar la solicitud a revisión
 * y asigna el pk de la solicitud a revisar.
 * @param resource de la solicitud
 */
function openAddRequestToMyReviewsModal(resource) {
  pkResource.value = resource.pk_request;
  modalAgregarMisRevisiones.value.abrirModal();
}

const { data } = useAuth();
const token = data.value?.accessToken;
const configEnv = useRuntimeConfig();
/**
 * Hace la petición para agregar la solicitud a revisión.
 */
async function addRequestToMyReviews() {
  try {
    // petición para añadir la solicitud a mis revisiones
    const response = await $fetch(`${configEnv.public.basePath}/api/solicitudes`, {
      method: 'POST',
      body: {
        pk: pkResource.value,
        token: token,
        status: 'on_review',
        rejection_reason: 'En revisión.', // no se puede quedar vacío ''
      },
    });
    console.warn(response);
    modalAgregarMisRevisiones.value.cerrarModal();
    // ir a Mis revisiones
    await navigateTo('/catalogo/revision-solicitudes/mis-revisiones');
  } catch (error) {
    console.error(error);
  }
}

/**
 * Agrega un recurso seleccionado al módulo de consulta y navega a la vista
 * @param resource del que se toma el pk para la selección
 */
async function openResourceView(resource) {
  if (
    resource.tipo_recurso === 'Capa Geográfica' ||
    resource.tipo_recurso === 'Capa Geográfica, Catálogo Externo'
  ) {
    useSelectedResources2Store().add(
      new SelectedLayer({ pk: resource.pk }),
      resourceTypeDic.dataLayer
    );
    await navigateTo('/consulta/capas');
  }
  if (resource.tipo_recurso === 'Datos Tabulados') {
    useSelectedResources2Store().add(
      new SelectedLayer({ pk: resource.pk }),
      resourceTypeDic.dataTable
    );
    await navigateTo('/consulta/tablas');
  }
  /* (objeto.tipo_recurso === 'Documentos') {
    navigateTo({
      path: '/catalogo/mis-archivos/editar-metadatos',
      query: { data: pk },
    });
  } */
  if (resource.tipo_recurso === 'Documentos') {
    useSelectedResources2Store().add(
      new SelectedLayer({ pk: resource.pk }),
      resourceTypeDic.document
    );
    await navigateTo('/consulta/documentos');
  }
}

/**
 * Formatea la fecha del recurso a esta forma: dd/mm/aaaa
 * @param fecha de actualización del recurso
 * @returns {Date} objeto con la fecha
 */
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    // month: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Valida si el tipo de recurso es documento o capa geométrica o no.
 * @returns {String} ya sea dataLayer, dataTable o document
 */
function tipoRecurso(recurso) {
  if (recurso.tipo_recurso === 'Documentos') {
    return 'document';
  } else if (recurso.tipo_recurso === 'Capa Geográfica, Catálogo Externo') {
    return 'Capa Geográfica';
  } else {
    return recurso.tipo_recurso === 'Capa Geográfica' ? 'dataLayer' : 'dataTable';
  }
}

function notifyReleaseRequest(resource) {
  shownModal.value = 'releaseOne';
  modalResource.value = resource.recurso_completo;
  resourceType.value = tipoRecurso(resource);
  nextTick(() => {
    releaseRequest.value?.abrirModalDescarga();
  });
}

/**
 * Abre el modal de descarga de un solo recurso
 * @param resource a descargar
 */
function notifyDownloadOneChild(resource) {
  shownModal.value = 'downloadOne';
  modalResource.value = resource.recurso_completo;
  resourceType.value = tipoRecurso(resource);
  nextTick(() => {
    downloadOneChild.value?.abrirModalDescarga();
  });
}
function notifyDeleteResource(resource) {
  resourceToDeleteTitle.value = resource.titulo;
  resourceToDeletePk.value = resource.pk;
  isBeingDeleted.value = false;
  modalEliminar.value?.abrirModal();
}

function cancelarEliminar() {
  modalEliminar.value?.cerrarModal();
}

const router = useRouter();
async function confirmarEliminar() {
  isBeingDeleted.value = true;
  /*   const token = data.value?.accessToken;
  const response = await $fetch('/api/delete-resource', {
    method: 'DELETE',
    headers: { token: token, pk: resourceToDeletePk.value },
  });
  //TODO: agregar manejo de errores
  console.warn('La res:', response);*/
  await wait(3000);
  isBeingDeleted.value = false;
  modalEliminar.value?.cerrarModal();
  router.go(0);
}

const modalComentarios = ref(null);
const comentarios = ref('');
const revisor = ref('');
const recursoSolicitud = ref({});
/**
 * Abre el modal de la acción comentarios en Reivisón de solicitudes
 * @param solicitud
 */
function abrirModalComentarios(solicitud) {
  modalComentarios.value.abrirModal();
  // console.log('solicitud', solicitud);
  // asignar si el valor es null
  comentarios.value = solicitud.comentarios || 'Aún no se ha revisado.';
  // TODO: utilizar la info del usuario del store
  // (solicitud.revisor === userInfo[0].email) => { userInfo.first_name + userInfo.last_name}
  revisor.value = solicitud.revisor;
  recursoSolicitud.value = solicitud;
}

const modalCancelarSolicitud = ref(null);
/**
 * Abre el modal de cancelar o regresar la solicitud a status pendiente
 * @param solicitud
 */
function abrirModalCancelarRevision(solicitud) {
  modalCancelarSolicitud.value.abrirModal();
  recursoSolicitud.value = solicitud;
}

/**
 * Remueve la solicitud on_review a pending
 */
async function removerRevision() {
  try {
    // petición para aceptar y publicar la solicitud del recurso
    const response = await $fetch(`${configEnv.public.basePath}/api/solicitudes`, {
      method: 'POST',
      body: {
        pk: recursoSolicitud.value.pk_request,
        token: token,
        status: 'pending',
        rejection_reason: 'Aún no se ha revisado.',
      },
    });
    console.warn(response);
    modalCancelarSolicitud.value.cerrarModal();
    // forzando recargar la página para ver el cambio
    location.reload();
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <div class="contenedor-tabla p-2">
    <div v-if="revisando" class="fondo-loader">
      <figure class="flex flex-contenido-centrado">
        <div class="flex-vertical-centrado" style="height: calc(100vh - 112px)">
          <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
        </div>
      </figure>
    </div>

    <table class="tabla-expandida">
      <caption>
        {{
          props.caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="(variable, v) in props.variables"
            :id="`${idAleatorio}-col-${v}`"
            :key="v"
            scope="col"
          >
            {{ dictTable[variable] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(datum, d) in props.datos" :id="`${idAleatorio}-ren-${d}`" :key="d">
          <td
            v-for="(variable, v) in props.variables"
            :key="v"
            :headers="`${idAleatorio}-ren-${d} ${idAleatorio}-col-${v}`"
          >
            {{
              variable !== 'tipo_recurso' &&
              variable !== 'acciones' &&
              variable !== 'actualizacion' &&
              variable !== 'categoria' &&
              variable !== 'estatus'
                ? datum[variable]?.toLocaleString('en')
                : ''
            }}

            <!-- Tipo de recurso -->
            <div v-if="variable === 'tipo_recurso'" class="flex" style="gap: 8px">
              <div
                v-if="datum[variable] === 'Documentos'"
                class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
                style="width: max-content"
              >
                <span>
                  <span class="pictograma-documento"></span>
                  {{ datum[variable] }}
                </span>
              </div>

              <div
                v-if="datum[variable] === 'Datos Tabulados'"
                class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
                style="width: max-content"
              >
                <span>
                  <span class="pictograma-tabla" />
                  {{ datum[variable] }}
                </span>
              </div>

              <div
                v-if="datum[variable].split(', ').includes('Capa Geográfica')"
                class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
                style="width: max-content"
              >
                <span>
                  <span class="pictograma-capas" />
                  {{ 'Capa Geográfica' }}
                </span>
              </div>

              <div
                v-if="datum[variable].split(', ').includes('Catálogo Externo')"
                class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
                style="width: max-content"
              >
                <span>
                  <span class="pictograma-colaborar" />
                  {{ 'Catálogo Externo' }}
                </span>
              </div>
            </div>

            <!-- Categoría -->
            <div v-if="variable === 'categoria'">
              {{
                datum[variable] !== null
                  ? categoriesInSpanish[datum[variable].gn_description]
                  : 'Sin Clasificar'
              }}
            </div>

            <!-- Actualización -->
            <div v-if="variable === 'actualizacion'">{{ formatearFecha(datum[variable]) }}</div>

            <!-- Acciones -->
            <div v-if="variable === 'acciones'">
              <div class="flex-width">
                <button
                  v-if="datum[variable].split(', ').includes('Editar')"
                  v-globo-informacion:izquierda="'Editar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Editar metadatos"
                  type="button"
                  @click="irARutaConQuery(datum)"
                >
                  <span class="pictograma-editar"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Ver')"
                  v-globo-informacion:izquierda="'Ver en visualizador'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Ver en visualizador"
                  type="button"
                  @click="openResourceView(datum)"
                >
                  <span class="pictograma-previsualizar"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Visualizar')"
                  v-globo-informacion:izquierda="'Visualizar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Visualizar archivo"
                  type="button"
                  @click="openResourceReview(datum)"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Revisar')"
                  v-globo-informacion:izquierda="'Revisar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Revisar archivo"
                  type="button"
                  @click="openResourceReview(datum)"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Añadir')"
                  v-globo-informacion:izquierda="'Agregar a mis revisiones'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Agregar a mis revisiones"
                  type="button"
                  @click="openAddRequestToMyReviewsModal(datum)"
                >
                  <span class="pictograma-agregar"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Publicar')"
                  v-globo-informacion:izquierda="'Publicar en catálogo'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Publicar en catálogo"
                  type="button"
                  @click="notifyReleaseRequest(datum)"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Comentarios')"
                  v-globo-informacion:izquierda="'Comentarios'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Comentarios de la solicitud"
                  type="button"
                  @click="abrirModalComentarios(datum)"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Descargar')"
                  v-globo-informacion:izquierda="'Descargar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Descargar archivo"
                  type="button"
                  @click="notifyDownloadOneChild(datum)"
                >
                  <span class="pictograma-archivo-descargar"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Cancelar')"
                  v-globo-informacion:izquierda="'Cancelar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Cancelar solicitud"
                  type="button"
                  @click="abrirModalCancelarRevision(datum)"
                >
                  <span class="pictograma-cerrar"></span>
                </button>
                <button
                  v-if="datum[variable].split(', ').includes('Remover')"
                  v-globo-informacion:izquierda="'Remover'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Remover archivo"
                  type="button"
                  @click="notifyDeleteResource(datum)"
                >
                  <span class="pictograma-eliminar"></span>
                </button>
              </div>
            </div>

            <!-- Estatus -->
            <div v-if="variable === 'estatus'" class="flex">
              <div
                v-if="datum[variable] === 'Pendiente' || datum[variable] === 'Pendiente revisor'"
                class="texto-color-alerta texto-centrado fondo-color-alerta borde borde-color-alerta borde-redondeado-8 p-1"
              >
                {{ datum[variable] }}
              </div>
              <div
                v-if="datum[variable] === 'En revisión'"
                class="texto-color-informacion texto-centrado fondo-color-informacion borde borde-color-informacion borde-redondeado-8 p-1"
              >
                {{ datum[variable] }}
              </div>
              <div
                v-if="datum[variable] === 'Publicado' || datum[variable] === 'Aceptado'"
                class="texto-color-confirmacion texto-centrado fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
              >
                {{ datum[variable] }}
              </div>
              <div
                v-if="datum[variable] === 'Rechazado' || datum[variable] === 'No aceptado'"
                class="texto-color-error texto-centrado fondo-color-error borde borde-color-error borde-redondeado-8 p-1"
              >
                {{ datum[variable] }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para publicar recurso -->
    <CatalogoModalPublicacion
      v-if="shownModal === 'releaseOne'"
      ref="releaseRequest"
      :key="`${modalResource.pk}_${resourceType}`"
      :resource-type="resourceType"
      :selected-element="modalResource"
    />
    <!-- Modal para descargar datos -->
    <ConsultaModalDescarga
      v-if="shownModal === 'downloadOne'"
      ref="downloadOneChild"
      :key="`${modalResource.pk}_${resourceType}`"
      :resource-type="resourceType"
      :selected-element="modalResource"
    />

    <ClientOnly>
      <!-- Modal Eliminar Recurso -->
      <SisdaiModal ref="modalEliminar">
        <template #encabezado>
          <h1>¿Deseas eliminar {{ resourceToDeleteTitle }}?</h1>
        </template>
        <template #cuerpo>
          <div class="flex m-y-2 flex-contenido-centrado">
            <div class="contenedor flex flex-contenido-centrado">
              <button
                type="button"
                class="boton-secundario"
                :disabled="isBeingDeleted"
                @click="cancelarEliminar"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="boton-primario"
                :disabled="isBeingDeleted"
                @click="confirmarEliminar"
              >
                Eliminar
              </button>
            </div>
            <div v-if="isBeingDeleted" class="columna-3 color-invertir">
              <img src="/img/loader.gif" alt="...Cargando" />
            </div>
          </div>
        </template>
      </SisdaiModal>

      <!-- Modal Añadir a Mis revisiones -->
      <SisdaiModal ref="modalAgregarMisRevisiones">
        <template #encabezado> <h2>Agregar a mi revisión</h2> </template>
        <template #cuerpo>
          <p>
            ¿Deseas añadir este documento a tu revisión? Al hacerlo, quedará reservado para ti y no
            podrá ser revisado por otras personas hasta que lo liberes o completes el proceso.
          </p>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalAgregarMisRevisiones.cerrarModal()"
          >
            Cancelar
          </button>
          <button class="boton-primario boton-chico" type="button" @click="addRequestToMyReviews">
            Añadir a mi revisión
          </button>
        </template>
      </SisdaiModal>

      <!-- Modal Comentarios de Solicitud -->
      <SisdaiModal ref="modalComentarios">
        <template #encabezado> <h2>Mensajes</h2> </template>
        <template #cuerpo>
          <p class="texto-color-acento">{{ revisor }}</p>
          <p>{{ comentarios }}</p>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalComentarios.cerrarModal()"
          >
            Cerrar
          </button>
          <!-- <button
            class="boton-primario boton-chico"
            type="button"
            @click="verSolicitudEnVisualizador"
          >
            Abrir en visualizador
          </button> -->
        </template>
      </SisdaiModal>

      <!-- Modal Cancelar Solicitud -->
      <SisdaiModal ref="modalCancelarSolicitud">
        <template #encabezado>
          <h2>Remover</h2>
        </template>
        <template #cuerpo>
          <p>
            ¿Estás segura(o) de remover este documento de tus revisiones? El archivo regresará a la
            sección de <i>Pendientes de revisor</i> para que otra persona pueda revisarlo.
          </p>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalCancelarSolicitud.cerrarModal()"
          >
            Cancelar
          </button>
          <button class="boton-primario boton-chico" type="button" @click="removerRevision">
            Remover
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.fondo-loader {
  width: calc(100% - 48px);
  height: calc(100% - 47px);
  position: absolute;
  top: 101.5px;
  bottom: 0;
  left: 48px;
  right: 0;
  background-color: var(--opacidad-ligero);
  z-index: 9996;
}
.contenedor-tabla {
  width: 100%;
  overflow: auto;
  display: inline-grid;
}
table {
  min-width: 600px;
  .flex-width {
    display: flex;
    gap: 16px;
    // min-width: 224px;
    width: fit-content;
  }
}
</style>
