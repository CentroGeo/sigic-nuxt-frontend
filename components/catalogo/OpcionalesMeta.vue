<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
/**
 * @typedef {Object} Props
 * @property {Object} [recurso={}] - Indica el recurso al que se le va a modificar los metadatos básicos.
 * @property {String} [resourcePk=''] - Indica la propiedad pk del recurso.
 * @property {String} [resourceType=''] - Indica el tipo de recurso.
 * @property {Boolean} [isModal=false] - Indica si el formulario va a ir en un modal o no
 */
/** @type {Props} */
const props = defineProps({
  recurso: {
    type: Object,
    default: () => ({}),
  },
  resourcePk: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String,
    default: '',
  },
  isModal: {
    type: Boolean,
    default: false,
  },
});
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
// const storeCatalogo = useCatalogoStore();
// console.log('props.recurso', props.recurso);
const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const campoEdicion = computed({
  get: () => storeMetadatos.metadata.edition,
  set: (value) => storeMetadatos.updateAttr('edition', value),
});
const campoDOI = computed({
  get: () => storeMetadatos.metadata.doi,
  set: (value) => storeMetadatos.updateAttr('doi', value),
});
const campoProposito = computed({
  get: () => storeMetadatos.metadata.purpose,
  set: (value) => storeMetadatos.updateAttr('purpose', value),
});
const campoInformacionAdicional = computed({
  get: () => storeMetadatos.metadata.supplemental_information,
  set: (value) => storeMetadatos.updateAttr('supplemental_information', value),
});
//const seleccionInicioExtension = ref('');
//const seleccionFinExtension = ref('');
const seleccionFrecuenciaActual = computed({
  get: () => storeMetadatos.metadata.maintenance_frequency,
  set: (value) => storeMetadatos.updateAttr('maintenance_frequency', value),
});
//const campoExtrametadato = ref('');
//const seleccionRecursosRelacionados = ref('');
//const campoPuntoContacto = ref('');
//const seleccionDuenio = ref('');
const campoPublisher = computed({
  get: () => storeMetadatos.metadata.publisher,
  set: (value) => storeMetadatos.updateAttr('publisher', value),
});
const dictFrecuenciaActual = [
  { unknown: 'se desconoce la frecuencia de actualización de los datos' },
  { continual: 'los datos se actualizan repetida y frecuentemente' },
  { notPlanned: 'no existen planes de actualizar los datos' },
  { daily: 'los datos se actualizan a diario' },
  { annually: 'los datos se actualizan cada año' },
  { asNeeded: 'los datos se actualizan cuando se considera necesario' },
  { monthly: 'los datos se actualizan todos los meses' },
  { fortnightly: 'los datos se actualizan cada dos semanas' },
  { irregular: 'los datos se actualizan a intervalos de duración irregular' },
  { weekly: 'los datos se actualizan semanalmente' },
  { biannually: 'los datos se actualizan dos veces al año' },
  { quarterly: 'los datos se actualizan cada tres meses' },
];

const geonodeUsers = ref([]);
const isLoading = ref(false);

async function getUsers() {
  isLoading.value = true;
  if (storeMetadatos.metadata.publisher && storeMetadatos.metadata.publisher.length > 0) {
    geonodeUsers.value.push({
      pk: storeMetadatos.metadata.publisher_pk,
      username: storeMetadatos.metadata.publisher,
    });
  }
  let endpoint = `${config.public.geonodeApi}/users`;
  do {
    const requestUsers = await gnoxyFetch(endpoint);
    if (!requestUsers.ok) {
      const error = await requestUsers.json();
      console.error('Falló petición de usuarios:', error);
    }
    const resUsers = await requestUsers.json();
    const newUsers = resUsers.users
      .map((d) => {
        return { pk: d.pk, username: d.username };
      })
      .filter((d) => d.username !== storeMetadatos.metadata.publisher);
    geonodeUsers.value = [...geonodeUsers.value, ...newUsers];

    endpoint = resUsers.links.next;
  } while (endpoint);
  isLoading.value = false;
}

getUsers();

watch(campoPublisher, () => {
  const selectedPublisher = geonodeUsers.value.find((d) => d.username === campoPublisher.value);
  storeMetadatos.updateAttr('publisher_pk', selectedPublisher.pk);
});

/* watch(
  () => storeMetadatos.metadata,
  (nv) => {
    console.log('nv', nv);
  },
  { deep: true }
); */
// function editarMetadatos(dato, valor) {
//   storeCatalogo.metadatos[dato] = valor;
//   // console.log(storeCatalogo.metadatos[dato]);
// }
// watch(
//   [
//     campoEdicion,
//     campoDOI,
//     campoProposito,
//     campoInformacionAdicional,
//     seleccionInicioExtension,
//     seleccionFinExtension,
//     seleccionFrecuenciaActual,
//     campoExtrametadato,
//     seleccionRecursosRelacionados,
//     campoPuntoContacto,
//     seleccionDuenio,
//   ],
//   (nv) => {
//     // console.log('nv', nv);
//     // actualizar datos en el store
//   }
// );
</script>
<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos Opcionales'"
      :exclude-links="props.isModal"
    />

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex">
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoEdicion"
              etiqueta="Edición"
              ejemplo="Indicar la referencia o la fuente del conjunto de datos"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoDOI"
              etiqueta="Identificador de Objeto Digital (DOI)"
              ejemplo=""
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoProposito"
              etiqueta="Propósito"
              ejemplo="Explicación general del conocimiento del productor de datos sobre el linaje de un conjunto de datos"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoInformacionAdicional"
              etiqueta="Información adicional"
              ejemplo="Proporciona una mejor comprensión del conjunto de datos cargado"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <!--         <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="seleccionInicioExtension"
              etiqueta="Inicio de extensión temporal (extend)"
              ejemplo="tipo date"
              tipo="date"
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="seleccionFinExtension"
              etiqueta="Fin de extensión temporal (extend)"
              ejemplo="tipo date"
              tipo="date"
            />
          </ClientOnly>
        </div> -->
        <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionFrecuenciaActual"
              etiqueta="Frencuencia de actualización"
            >
              <!--               <option value="" selected="">---------</option> -->
              <option
                v-for="value in dictFrecuenciaActual"
                :key="Object.keys(value)"
                :value="Object.keys(value)"
              >
                {{ value[Object.keys(value)] }}
              </option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <!--         <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoExtrametadato"
              etiqueta="Extrametadato"
              ejemplo=""
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div> -->
        <!--         <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionRecursosRelacionados"
              etiqueta="Recursos relacionados"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </SisdaiSelector>
          </ClientOnly>
        </div> -->
        <!--         <div class="columna-16">
          <div class="fondo-color-neutro borde-redondeado-16 p-2">
            <p class="h3 m-t-0">Responsables</p>
            <div class="flex">
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCampoBase
                    v-model="campoPuntoContacto"
                    etiqueta="Punto de contacto"
                    ejemplo=""
                  />
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionDuenio"
                    etiqueta="Dueño"
                    texto_ayuda="Responsable y permisos"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div> -->
        <ClientOnly>
          <SisdaiSelector
            v-model="campoPublisher"
            etiqueta="Publisher"
            ejemplo="Añade nombre de publisher"
            :es_obligatorio="true"
          >
            <option v-for="value in geonodeUsers" :key="value.pk" :value="value.username">
              {{ value.username }}
            </option>
            <option v-if="isLoading">...Cargando</option>
          </SisdaiSelector>
        </ClientOnly>
      </div>

      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`3-${props.resourcePk}-buttons`"
        :resource="props.recurso"
        :title="'MetadatosOpcionales'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      />
    </div>
  </div>
</template>
