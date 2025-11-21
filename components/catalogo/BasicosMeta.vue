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
//const storeCatalogo = useCatalogoStore();
const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const imagen = ref();
const campoTitulo = computed({
  get: () => storeMetadatos.metadata.title,
  set: (value) => storeMetadatos.updateAttr('title', value),
});
const campoResumen = computed({
  get: () => storeMetadatos.metadata.abstract,
  set: (value) => storeMetadatos.updateAttr('abstract', value),
});

const seleccionFecha = computed({
  get: () => storeMetadatos.metadata.date,
  set: (value) => storeMetadatos.updateAttr('date', value),
});
const seleccionCategoria = computed({
  get: () => storeMetadatos.metadata.category,
  set: (value) => storeMetadatos.updateAttr('category', value),
});
const campoPalabrasClave = ref('');
const campoAutor = computed({
  get: () => storeMetadatos.metadata.metadata_author,
  set: (value) => storeMetadatos.updateAttr('metadata_author', value),
});
/* const campoAnioPublicacion = ref(''); */

const dictCategoria = [
  { imageryBaseMapsEarthCover: 'Mapas Base y Cobertura Terrestre' },
  { society: 'Sociedad' },
  { economy: 'Economía' },
  { utilitiesCommunication: 'Servicios Públicos y Comunicación' },
  { environment: 'Medio Ambiente' },
  { oceans: 'Océanos' },
  { biota: 'Biota' },
  { health: 'Salud' },
  { elevation: 'Elevación' },
  { geoscientificInformation: 'Información Geocientífica' },
  { planningCadastre: 'Planeación Catastral' },
  { inlandWaters: 'Aguas Continentales' },
  { boundaries: 'Fronteras' },
  { structure: 'Estructura' },
  { transportation: 'Transporte' },
  { intelligenceMilitary: 'Inteligencia Militar' },
  { location: 'Ubicación' },
  { climatologyMeteorologyAtmosphere: 'Climatología, Meteorología y Atmósfera' },
  { farming: 'Agricultura' },
  { population: 'Población' },
];

const geonodeUsers = ref(['...Cargando']);
const loadingUsers = ref(false);

async function getUsers() {
  // Esta parte es para obtener todas las categorias
  loadingUsers.value = true;
  const url = `${config.public.geonodeApi}/users`;
  const requestTotal = await gnoxyFetch(url);
  const resTotal = await requestTotal.json();
  const totalUsers = resTotal.total;
  const requestUsers = await gnoxyFetch(`${url}?page_size=${totalUsers}`);
  const resUsers = await requestUsers.json();
  geonodeUsers.value = resUsers.users.map((d) => {
    return { pk: d.pk, username: d.username };
  });
  loadingUsers.value = false;
}

getUsers();

watch(campoAutor, () => {
  const selectedAuthor = geonodeUsers.value.find((d) => d.username === campoAutor.value);
  storeMetadatos.updateAttr('metadata_author_pk', selectedAuthor.pk);
});

const dragNdDrop = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
async function guardarImagen(files) {
  // solo una o la primera archivo de imagen
  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    imagen.value = files;
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
}

/* watch(
  () => storeMetadatos.metadata,
  (nv) => {
    console.log('nv', nv);
  },
  { deep: true }
); */
</script>

<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos básicos'"
      :exclude-links="props.isModal"
    />

    <div v-if="!props.isModal" style="opacity: 0.5">
      <p class="texto-peso-600">
        Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG
      </p>
      <!-- Drag & Drop -->
      <ClientOnly>
        <CatalogoElementoDragNdDrop ref="dragNdDrop" @pasar-archivo="(i) => guardarImagen(i)" />
      </ClientOnly>
    </div>

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex" style="gap: 0 24px">
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoTitulo"
              etiqueta="Título"
              ejemplo="Añade un nombre"
              tipo="text"
              :es_etiqueta_visible="true"
              :es_obligatorio="true"
            />
            <SisdaiCampoBase
              v-model="campoResumen"
              etiqueta="Resumen"
              ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
              tipo="text"
              :es_etiqueta_visible="true"
              :es_obligatorio="true"
              texto_ayuda="El campo tener un mínimo de 30 caracteres"
            />
          </ClientOnly>
        </div>
        <!--         <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionTipoFecha"
              etiqueta="Tipo de fecha"
              texto_ayuda="Creación, publicación o revisión."
            >
              <option value="creation">Creación</option>
              <option value="publication">Publicación</option>
              <option value="revison">Revisón</option>
            </SisdaiSelector>
          </ClientOnly>
        </div> -->
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="seleccionFecha"
              etiqueta="Fecha"
              ejemplo="tipo date"
              tipo="date"
              texto_ayuda="aaaa-mm-dd"
              :es_obligatorio="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionCategoria"
              etiqueta="Categoría"
              :es_obligatorio="true"
            >
              <option
                v-for="value in dictCategoria"
                :key="Object.keys(value)"
                :value="Object.keys(value)"
              >
                {{ value[Object.keys(value)] }}
              </option>
            </SisdaiSelector>

            <SisdaiCampoBase
              v-model="campoPalabrasClave"
              style="opacity: 0.5"
              etiqueta="Palabras clave"
              ejemplo="Agua, educación, conservación..."
              :es_obligatorio="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <!--            <SisdaiCampoBase
              v-model="campoAutor"
              etiqueta="Autor (de los metadatos)"
              ejemplo="Añade nombre de autor"
              :es_obligatorio="true"
            /> -->
            <SisdaiSelector
              v-model="campoAutor"
              etiqueta="Autor (de los metadatos)"
              ejemplo="Añade nombre de autor"
              :es_obligatorio="true"
              style="opacity: 0.5"
            >
              <option v-for="value in geonodeUsers" :key="value.pk" :value="value.username">
                {{ value.username }}
              </option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <!--         <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoAnioPublicacion"
              etiqueta="Año de publicación"
              ejemplo="Ej. 2002"
            />
          </ClientOnly>
        </div> -->
      </div>

      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`1-${props.resourcePk}-buttons`"
        :resource="props.recurso"
        :title="'MetadatosBasicos'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      />
    </div>
  </div>
</template>
