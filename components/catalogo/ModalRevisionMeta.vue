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

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const isLoading = ref(false);
const fetchFailed = ref(false);
const resource = ref({});
const modalRevisionBasicos = ref(null);
const modalRevisionLicencias = ref(null);
const modalRevisionOpcionales = ref(null);
const modalRevisionAtributos = ref(null);

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

const dictRestricciones = {
  copyright: `Derecho exclusivo a la publicación, producción o venta de los derechos de una obra literaria, 
    dramática, musical o artística, o al uso de una marca o etiqueta comercial, otorgado por la ley 
    durante un periodo específico de tiempo a la persona autora, compositora, artista o distribuidora.`,
  patent: `El gobierno ha otorgado el derecho exclusivo de hacer, vender, usar u otorgar licencia de patente 
    de alguna invención o descubrimiento.`,
  patentPending: `Información producida o vendida en espera de recibir una patente.`,
  trademark: `El nombre, símbolo u otro dispositivo que identifique a un producto. Éste debe estar registrado 
    oficialmente y su uso está limitado jurídicamente al dueño o fabricante del producto.`,
  license: 'Permiso formal para hacer algo.',
  intellectualPropertyRights: `Derechos para controlar y lucrar con la distribución de propiedad no tangible 
    proveniente de actividades creativas.`,
  restricted: 'No se permite su circulación en general.',
  otherRestrictions: 'Otras restricciones.',
};

const dictFrecuencia = {
  unknown: 'Se desconoce la frecuencia de actualización de los datos',
  continual: 'Los datos se actualizan repetida y frecuentemente',
  notPlanned: 'No existen planes de actualizar los datos',
  daily: 'Los datos se actualizan a diario',
  annually: 'Los datos se actualizan cada año',
  asNeeded: 'Los datos se actualizan cuando se considera necesario',
  monthly: 'Los datos se actualizan todos los meses',
  fortnightly: 'Los datos se actualizan cada dos semanas',
  irregular: 'Los datos se actualizan a intervalos de duración irregular',
  weekly: 'Los datos se actualizan semanalmente',
  biannually: 'Los datos se actualizan dos veces al año',
  quarterly: 'Los datos se actualizan cada tres meses',
};

const variables = {
  attribute: 'Atributo',
  attribute_label: 'Etiqueta',
  description: 'Descripción',
  display_order: 'Mostrar Orden',
  visible: 'Visible',
};

/**
 * Crea una cadena de palabras clave iterando sobre el array de keywords
 * @param resourceKeywords
 */
function getKeywords(resourceKeywords) {
  const keywords = resourceKeywords.map((d) => d.name);
  return keywords.join(', ');
}

function findLanguage(language) {
  const languageDict = dictIdiomas.find((d) => Object.keys(d).includes(language));
  return languageDict[language];
}

/** Pide los metadatos del recurso a revisar */
async function fetchMetadata() {
  const type = props.resourceType === 'documents' ? 'document' : 'dataset';
  const url = `${config.public.geonodeApi}/${props.resourceType}/${props.reviewPk}`;
  try {
    const request = await gnoxyFetch(url);
    if (!request.ok) {
      return 'Error';
    } else {
      const res = await request.json();
      return res[type];
    }
  } catch {
    ('Error');
  }
}

/** Se encarga de construir el objeto de metadatos
 * obteniendo los valores como se les desea mostrar en la UI.
 * O crea la alerta de que hubo un error.
 **/
async function buildResourceInfo() {
  isLoading.value = true;
  const data = await fetchMetadata();
  if (data === 'Error') {
    fetchFailed.value = true;
  } else {
    fetchFailed.value = false;
    resource.value['title'] = data.title;
    resource.value['sourcetype'] = data.sourcetype;
    resource.value['abstract'] = data.raw_abstract;
    resource.value['date_type'] = dateTypeDict[data.date_type];
    resource.value['date'] = data.date;
    resource.value['category'] = categoriesInSpanish[data.category.gn_description];
    resource.value['keywords'] = getKeywords(data.keywords);
    resource.value['language'] = findLanguage(data.language);
    resource.value['license'] =
      dictLicencia[data.license?.identifier] || 'Información no proporcionada';
    resource.value['attribution'] = data.attribution;
    resource.value['data_quality_statement'] =
      data.raw_data_quality_statement?.length > 0
        ? data.raw_data_quality_statement
        : 'Información no proporcionada';
    resource.value['restrictions'] =
      dictRestricciones[data.restriction_code_type?.identifier] || 'Información no proporcionada';
    resource.value['constraints_other'] =
      data.raw_constraints_other?.length > 0
        ? data.raw_constraints_other
        : 'Información no proporcionada';
    resource.value['edition'] =
      data.edition?.length > 0 ? data.edition : 'Información no proporcionada';
    resource.value['doi'] = data.doi?.length > 0 ? data.doi : 'Información no proporcionada';
    resource.value['purpose'] =
      data.raw_purpose?.length > 0 ? data.raw_purpose : 'Información no proporcionada';
    resource.value['supplemental_information'] =
      data.raw_supplemental_information?.length > 0
        ? data.raw_supplemental_information
        : 'Información no proporcionada';
    resource.value['maintenance_frequency'] =
      dictFrecuencia[data.maintenance_frequency] || 'Información no proporcionada';

    resource.value['attribute_set'] =
      props.resourceType !== 'documents'
        ? data['attribute_set'].sort((a, b) => a.display_order - b.display_order)
        : [];
  }
  isLoading.value = false;
}

function abrirModalRevision() {
  modalRevisionBasicos.value?.abrirModal();
}

defineExpose({
  abrirModalRevision,
});

onMounted(async () => {
  buildResourceInfo();
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
            <img
              class="color-invertir"
              :src="`${config.app.baseURL}img/loader.gif`"
              alt="Loader de SIGIC"
            />
            <figcaption class="texto-centrado">Obteniendo Metadatos</figcaption>
          </figure>
        </div>
      </template>

      <!--Cuerpo de metadatos básicos-->
      <template v-else-if="!isLoading && !fetchFailed" #cuerpo>
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

      <!--Cuerpo si fracasa la petición-->
      <template v-else-if="!isLoading && fetchFailed" #cuerpo>
        <div
          class="flex m-y-2 borde-redondeado-16 flex-contenido-centrado fondo-color-error texto-color-error borde p-1"
        >
          <div class="columna-3 flex-vertical-centrado">
            <span class="pictograma-alerta pictograma-grande"></span>
          </div>
          <p class="columna-13">
            No pudimos recuperar la información. Revisa tu conexión e intentalo de nuevo más tarde.
          </p>
        </div>
      </template>
      <!--Botones-->
      <template v-if="!isLoading && !fetchFailed" #pie>
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

      <!--Cuerpo de metadatos opcionales-->
      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Metadatos Opcionales'"
          :exclude-links="true"
        />

        <div class="m-t-3">
          <div class="flex">
            <div class="m-b-2 columna-16">
              <label class="m-0">Edición</label>
              <p class="m-0">
                {{ resource.edition }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">DOI</label>
              <p class="m-0">
                {{ resource.doi }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Propósito</label>
              <p class="m-0">
                {{ resource.purpose }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Información Adicional</label>
              <p class="m-0">
                {{ resource.supplemental_information }}
              </p>
            </div>
            <div class="m-b-2 columna-16">
              <label class="m-0">Frecuencia de actualización</label>
              <p class="m-0">
                {{ resource.maintenance_frequency }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!--Botones-->
      <template #pie>
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
          <div
            v-if="props.resourceType !== 'documents' && resource.sourcetype === 'LOCAL'"
            class="columna-8"
          >
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

    <SisdaiModal v-if="!isLoading && resource.sourcetype === 'LOCAL'" ref="modalRevisionAtributos">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <!--Cuerpo de attributos-->
      <template #cuerpo>
        <CatalogoHeaderMetadatos
          :resource="resource"
          :title="'Atributos del Conjunto de Datos'"
          :exclude-links="true"
        />

        <div class="contenedor-tabla p-2">
          <table v-if="resource.attribute_set.length > 0">
            <thead>
              <tr>
                <th
                  v-for="(variable, v) in Object.keys(variables)"
                  :id="`${variable}-col-${v}`"
                  :key="v"
                  scope="col"
                >
                  {{ variables[variable] }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(datum, d) in resource.attribute_set" :id="`${datum}-ren-${d}`" :key="d">
                <td>{{ datum['attribute'] }}</td>
                <td>{{ datum['attribute_label'] }}</td>
                <td>{{ datum['description'] }}</td>
                <td>{{ datum['display_order'] }}</td>
                <td>{{ datum['visible'] ? 'Visible' : 'No visible' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <!--Botones-->
      <template #pie>
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
