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

const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const { data } = useAuth();
const configEnv = useRuntimeConfig();

const campoTitulo = computed({
  get: () => storeMetadatos.metadata.title,
  set: (value) => storeMetadatos.updateAttr('title', value),
});
const campoResumen = computed({
  get: () => storeMetadatos.metadata.abstract,
  set: (value) => storeMetadatos.updateAttr('abstract', value),
});

const campoFecha = computed({
  get: () => storeMetadatos.metadata.date,
  set: (value) => storeMetadatos.updateAttr('date', value),
});

const campoTipoFecha = computed({
  get: () => storeMetadatos.metadata.date_type,
  set: (value) => storeMetadatos.updateAttr('date_type', value),
});

const campoCategoria = computed({
  get: () => storeMetadatos.metadata.category,
  set: (value) => storeMetadatos.updateAttr('category', value),
});
const campoPalabrasClave = computed({
  get: () => storeMetadatos.metadata.keywords,
  set: (value) => storeMetadatos.updateAttr('keywords', value),
});

const dictCategoria = [
  { farming: 'Agricultura' },
  { inlandWaters: 'Aguas Continentales' },
  { biota: 'Biota' },
  { climatologyMeteorologyAtmosphere: 'Climatología, Meteorología y Atmósfera' },
  { economy: 'Economía' },
  { elevation: 'Elevación' },
  { structure: 'Estructura' },
  { boundaries: 'Fronteras' },
  { geoscientificInformation: 'Información Geocientífica' },
  { intelligenceMilitary: 'Inteligencia Militar' },
  { imageryBaseMapsEarthCover: 'Mapas Base y Cobertura Terrestre' },
  { environment: 'Medio Ambiente' },
  { oceans: 'Océanos' },
  { planningCadastre: 'Planeación Catastral' },
  { population: 'Población' },
  { health: 'Salud' },
  { utilitiesCommunication: 'Servicios Públicos y Comunicación' },
  { society: 'Sociedad' },
  { transportation: 'Transporte' },
  { location: 'Ubicación' },
];

const dragNdDrop = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
async function guardarImagen(files) {
  const token = ref(data.value?.accessToken);

  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();

    // Enviamos SOLO el primer file
    formData.append('file', files[0]);
    formData.append('token', token.value);
    formData.append('pk', props.resourcePk);

    const endpoint = `${configEnv.public.basePath}/api/metadatos-thumbnail`;
    // Mandamos el formdata a subirse por
    const response = await fetch(endpoint, {
      method: 'PUT',
      body: formData,
    });

    console.warn(await response.json());
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
}
</script>

<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos básicos'"
      :exclude-links="props.isModal"
    />
    <p class="m-t-2 m-b-0">* Campos obligatorios</p>

    <div v-if="!props.isModal">
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
              etiqueta="Título*"
              ejemplo="Añade un nombre"
              tipo="text"
              :es_etiqueta_visible="true"
            />
            <SisdaiCampoBase
              v-model="campoResumen"
              class="m-y-3"
              etiqueta="Resumen"
              ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector
              v-model="campoTipoFecha"
              etiqueta="Tipo de fecha*"
              texto_ayuda="Creación, publicación o revisión."
            >
              <option value="creation">Creación</option>
              <option value="publication">Publicación</option>
              <option value="revision">Revisón</option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoFecha"
              etiqueta="Fecha*"
              ejemplo="tipo date"
              tipo="date"
              texto_ayuda="aaaa-mm-dd"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector v-model="campoCategoria" etiqueta="Categoría*">
              <option value="">----</option>
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
              class="m-t-3"
              etiqueta="Palabras clave *"
              ejemplo="Agua, educación, conservación..."
            />
          </ClientOnly>
        </div>
      </div>

      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`1-${props.resourcePk}-buttons`"
        class="m-t-2"
        :resource="props.recurso"
        :title="'MetadatosBasicos'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      />
    </div>
  </div>
</template>
