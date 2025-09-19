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
const storeCatalogo = useCatalogoStore();
const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
//const imagen = ref();
const campoTitulo = computed({
  get: () => storeMetadatos.metadata.title,
  set: (value) => storeMetadatos.updateAttr('title', value),
});
//const campoTitulo = ref(props.recurso.title);
const campoResumen = ref(props.recurso.raw_abstract);
const seleccionTipoFecha = ref('');
const seleccionFecha = ref('');
const seleccionCategoria = ref('');
const seleccionGrupo = ref('');
const campoPalabrasClave = ref('');
const campoAutor = ref('');
const campoAnioPublicacion = ref('');

function editarMetadatos(dato, valor) {
  storeCatalogo.metadatos[dato] = valor;
  // console.log(storeCatalogo.metadatos[dato]);
}

watch([campoTitulo, campoResumen], (nv) => {
  //console.log('nv', nv);
  editarMetadatos('title', nv[0]);
  editarMetadatos('abstract', nv[1]);
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
</script>

<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos básicos'"
      :exclude-links="props.isModal"
    />

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
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionTipoFecha"
              etiqueta="Tipo de fecha"
              texto_ayuda="Creación, publicación o revisión."
            >
              <option value="creacion">Creación</option>
              <option value="publicacion">Publicación</option>
              <option value="revison">Revisón</option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="seleccionFecha"
              etiqueta="Fecha"
              ejemplo="tipo date"
              tipo="date"
              texto_ayuda="aaaa-mm-dd"
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
              <option value="imagery_base_maps_earth_cover">
                Mapas Base y Cobertura Terrestre
              </option>
              <option value="society">Sociedad</option>
              <option value="economy">Economía</option>
              <option value="utilities_communication">Servicios Públicos y Comunicación</option>
              <option value="environment">Medio Ambiente</option>
              <option value="oceans">Océanos</option>
              <option value="biota">Biota</option>
              <option value="health">Salud</option>
              <option value="elevation">Elevación</option>
              <option value="geoscientific_information">Información Geocientífica</option>
              <option value="planning_cadastre">Planeación Catastral</option>
              <option value="Inland Waters">Aguas Continentales</option>
              <option value="boundaries">Fronteras</option>
              <option value="structure">Estructura</option>
              <option value="transportation">Transporte</option>
              <option value="intelligence_military">Inteligencia Militar</option>
              <option value="location">Ubicación</option>
              <option value="climatology_meteorology_atmosphere">
                Climatología, Meteorología y Atmósfera
              </option>
              <option value="farming">Agricultura</option>
              <option value="population">Población</option>
            </SisdaiSelector>
            <SisdaiSelector
              v-model="seleccionGrupo"
              etiqueta="Selecciona al grupo con el que compartirás tu archivo"
              texto_ayuda=" "
            >
              <option value="1">grupo uno publico</option>
            </SisdaiSelector>
            <SisdaiCampoBase
              v-model="campoPalabrasClave"
              etiqueta="Palabras clave"
              ejemplo="Agua, educación, conservación..."
              :es_obligatorio="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoAutor"
              etiqueta="Autor"
              ejemplo="Añade nombre de autor"
            />
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoAnioPublicacion"
              etiqueta="Año de publicación"
              ejemplo="Ej. 2002"
            />
          </ClientOnly>
        </div>
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
