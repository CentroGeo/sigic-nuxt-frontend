<script setup>
import { categoriesInSpanish, resourceTypeDic } from '~/utils/consulta';
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
const { data } = useAuth();
const idAleatorio = 'id-' + Math.random().toString(36).substring(2);
const shownModal = ref('ninguno');
const modalResource = ref(null);
const downloadOneChild = ref(null);
const releaseRequest = ref(null);
const resourceType = ref('');

// diccionario para colocar acentos
const dictTable = ref({
  pk: 'pk',
  titulo: 'Título',
  tipo_recurso: 'Tipo de archivo',
  categoria: 'Categoría',
  actualizacion: 'Actualización',
  acciones: 'Acciones',
  estatus: 'Estatus',
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

function notifyDownloadOneChild(resource) {
  shownModal.value = 'downloadOne';
  modalResource.value = resource.recurso_completo;
  resourceType.value = tipoRecurso(resource);
  nextTick(() => {
    downloadOneChild.value?.abrirModalDescarga();
  });
}

async function deleteResource(resource) {
  console.warn('borrar:', resource);
  const token = data.value?.accessToken;
  const response = await $fetch('/api/delete-resource', {
    method: 'DELETE',
    headers: { token: token, pk: resource.pk },
  });
  //TODO: agregar manejo de errores
  console.warn('La res:', response);
  const router = useRouter();
  router.go(0);
}
</script>

<template>
  <div class="contenedor-tabla p-2">
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
                  v-if="datum[variable].split(', ').includes('Remover')"
                  v-globo-informacion:izquierda="'Remover'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Remover archivo"
                  type="button"
                  @click="deleteResource(datum)"
                >
                  <span class="pictograma-eliminar"></span>
                </button>
              </div>

              <!--               <div v-if="datum[variable] === 'Editar, Ver, Descargar, Remover'" class="flex-width">
                <button
                  v-globo-informacion:izquierda="'Editar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Editar metadatos"
                  type="button"
                  @click="irARutaConQuery(datum)"
                >
                  <span class="pictograma-editar"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Ver en visualizador'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Ver en visualizador"
                  type="button"
                  @click="openResourceView(datum)"
                >
                  <span class="pictograma-previsualizar"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Publicar en catálogo'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Publicar en catálogo"
                  type="button"
                  @click="notifyReleaseRequest(datum)"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Descargar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Descargar archivo"
                  type="button"
                  @click="notifyDownloadOneChild(datum)"
                >
                  <span class="pictograma-archivo-descargar"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Remover'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Remover archivo"
                  type="button"
                >
                  <span class="pictograma-eliminar"></span>
                </button>
              </div>
              <div v-if="datum[variable] === 'Ver, Descargar'" class="flex-width">
                <button
                  v-globo-informacion:izquierda="'Ver en visualizador'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Ver en visualizador"
                  type="button"
                  @click="openResourceView(datum)"
                >
                  <span class="pictograma-previsualizar"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Descargar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Descargar archivo"
                  type="button"
                  @click="notifyDownloadOneChild(datum)"
                >
                  <span class="pictograma-archivo-descargar"></span>
                </button>
              </div>
              <div v-if="datum[variable] === 'Editar, Remover'" class="flex-width">
                <button
                  v-globo-informacion:izquierda="'Editar'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Editar metadatos"
                  type="button"
                  @click="irARutaConQuery(datum)"
                >
                  <span class="pictograma-editar"></span>
                </button>
                <button
                  v-globo-informacion:izquierda="'Remover'"
                  class="boton-pictograma boton-secundario"
                  aria-label="Remover archivo"
                  type="button"
                >
                  <span class="pictograma-eliminar"></span>
                </button>
              </div> -->
            </div>

            <!-- Estatus -->
            <div v-if="variable === 'estatus'" class="flex">
              <div
                v-if="datum[variable] === 'Pendiente'"
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
                v-if="datum[variable] === 'Publicado'"
                class="texto-color-confirmacion texto-centrado fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
              >
                {{ datum[variable] }}
              </div>
              <div
                v-if="datum[variable] === 'No aceptado'"
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
  </div>
</template>

<style lang="scss" scoped>
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
