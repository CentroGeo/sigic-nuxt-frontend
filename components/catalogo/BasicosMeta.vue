<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { useResourcesSupplements } from '~/composables/useResourcesSupplements';
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
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const { data } = useAuth();
const config = useRuntimeConfig();
const { importMetadataFromXML } = useResourcesSupplements();

// --- Importación de metadatos desde XML ---
const mostrarImport = ref(false);
const importando = ref(false);
const importResult = ref(null);
const importError = ref(null);
const dragNdDropXml = ref(null);

const fieldLabels = {
  title: 'Título',
  abstract: 'Resumen',
  date: 'Fecha',
  date_type: 'Tipo de fecha',
  category: 'Categoría',
  keywords: 'Palabras clave',
  language: 'Idioma',
  attribution: 'Atribución',
  license: 'Licencia',
  purpose: 'Propósito',
  supplemental_information: 'Información suplementaria',
  data_quality_statement: 'Calidad de datos',
  restriction_code_type: 'Tipo de restricción',
  constraints_other: 'Otras restricciones',
  edition: 'Edición',
  doi: 'DOI',
  maintenance_frequency: 'Frecuencia de actualización',
};

async function handleImportFile(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file.name.endsWith('.xml')) {
    dragNdDropXml.value?.archivoNoValido();
    return;
  }
  importando.value = true;
  importResult.value = null;
  importError.value = null;
  if (data.value?.error === 'RefreshAccessTokenError' || !data.value?.accessToken) {
    importError.value = 'Sesión expirada. Cierra sesión, vuelve a iniciarla e intenta de nuevo.';
    importando.value = false;
    return;
  }
  const result = await importMetadataFromXML({
    pk: props.resourcePk,
    file,
    token: data.value?.accessToken,
  });
  if (result && result.fields) {
    storeMetadatos.fillFromImport(result.fields);
    const fieldNames = Object.keys(result.fields)
      .filter((k) => result.fields[k] !== null && result.fields[k] !== undefined)
      .map((k) => fieldLabels[k] || k);
    const formatLabels = { iso19139: 'ISO 19139', dublin_core: 'Dublin Core', fgdc: 'FGDC' };
    importResult.value = {
      format: formatLabels[result.format] ?? result.format,
      count: fieldNames.length,
      fieldNames,
    };
  } else if (result?._error) {
    if (result.status === 401) {
      importError.value = 'Sesión expirada. Cierra sesión, vuelve a iniciarla e intenta de nuevo.';
    } else {
      importError.value = result.message || 'Error al procesar el archivo XML.';
    }
  } else {
    importError.value =
      'No se pudo procesar el archivo. Verifica que sea un XML válido en formato ISO 19139, Dublin Core o FGDC.';
  }
  importando.value = false;
}

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
const campoPalabrasClave = computed({
  get: () => storeMetadatos.metadata.keywords,
  set: (value) => storeMetadatos.updateAttr('keywords', value),
});

// ── Categorías ──────────────────────────────────────────────────────────────

const dictCategoriaOGC = [
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

const dictCategoriaSIGIC = [
  { medioAmbienteRecursosNaturales: 'Medio ambiente y recursos naturales' },
  { infraestructuraServiciosUrbanosRegionales: 'Infraestructura y servicios urbanos regionales' },
  { territorioLimitesCatastro: 'Territorio, límites y catastro' },
  { sociedadDemografiaEconomia: 'Sociedad, demografía y economía' },
  { sensoresRemotosMapasBase: 'Sensores remotos y mapas base' },
];

// Categorías sincronizadas con el store
const categoriaOGC = computed({
  get: () => {
    //Si el usuario ya interactuó, respetamos ese valor
    if (storeMetadatos.metadata.categoriaOGC) return storeMetadatos.metadata.categoriaOGC;

    //Si no, tomamos la categoría original guardada en BD
    const savedCategory =
      storeMetadatos.metadata.category?.identifier || storeMetadatos.metadata.category;

    //Verificamos si esa categoría pertenece a la lista OGC
    const existsInOGC = dictCategoriaOGC.some((item) => Object.keys(item)[0] === savedCategory);

    return existsInOGC ? savedCategory : '';
  },
  set: (val) => {
    storeMetadatos.updateAttr('categoriaOGC', val);
    if (val) {
      // Nos aseguramos de que actualice el campo maestro
      storeMetadatos.updateAttr('category', val);
    }
  },
});

// Categoría SIGIC se guarda en el store y SIEMPRE sobreescribe la categoría del previo selector
const categoriaSIGIC = computed({
  get: () => {
    if (storeMetadatos.metadata.categoriaSIGIC) return storeMetadatos.metadata.categoriaSIGIC;

    const savedCategory =
      storeMetadatos.metadata.category?.identifier || storeMetadatos.metadata.category;
    const existsInSIGIC = dictCategoriaSIGIC.some((item) => Object.keys(item)[0] === savedCategory);

    return existsInSIGIC ? savedCategory : '';
  },
  set: (val) => {
    storeMetadatos.updateAttr('categoriaSIGIC', val);
    if (val) {
      storeMetadatos.updateAttr('category', val);
    }
  },
});
// ── Imagen ───────────────────────────────────────────────────────────────────

const dragNdDrop = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
async function guardarImagen(files) {
  const token = ref(data.value?.accessToken);
  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('token', token.value);
    formData.append('pk', props.resourcePk);
    const response = await fetch(`${config.app.baseURL}api/metadatos-thumbnail`, {
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
      :is-preview="isPreview"
      ,
    />
    <p class="m-t-2 m-b-0">* Campos obligatorios</p>

    <div v-if="!props.isModal">
      <p class="texto-peso-600">
        Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG
      </p>
      <ClientOnly>
        <CatalogoElementoDragNdDrop ref="dragNdDrop" @pasar-archivo="(i) => guardarImagen(i)" />
      </ClientOnly>
    </div>

    <!-- Importar metadatos desde XML -->
    <div v-if="!props.isModal" class="m-t-4 m-b-2">
      <button
        type="button"
        class="boton-secundario"
        style="display: flex; align-items: center; gap: 0.5rem"
        @click="mostrarImport = !mostrarImport"
      >
        <span
          :class="mostrarImport ? 'pictograma-angulo-abajo' : 'pictograma-angulo-derecho'"
          aria-hidden="true"
        />
        Importar metadatos desde archivo XML
      </button>

      <div v-if="mostrarImport" class="m-t-3">
        <p class="m-b-2" style="font-size: 0.9em">
          Sube un archivo <b>.xml</b> en formato <b>ISO 19139</b> o <b>Dublin Core</b>. Los campos
          encontrados pre-llenarán el formulario; puedes ajustarlos antes de guardar.
        </p>
        <ClientOnly>
          <CatalogoElementoDragNdDrop
            ref="dragNdDropXml"
            @pasar-archivo="(i) => handleImportFile(i)"
          />
        </ClientOnly>

        <!-- Cargando -->
        <div v-if="importando" class="flex m-t-2" style="align-items: center; gap: 0.5rem">
          <img
            class="color-invertir"
            :src="`${config.app.baseURL}img/loader.gif`"
            height="28"
            alt="Procesando..."
          />
          <span>Procesando archivo XML...</span>
        </div>

        <!-- Éxito -->
        <div
          v-if="importResult && !importando"
          class="fondo-color-confirmacion texto-color-confirmacion p-3 borde-redondeado-16 m-t-2"
        >
          <div class="flex" style="gap: 0.4rem; align-items: center">
            <span class="pictograma-aprobado" aria-hidden="true" />
            <b>Formato detectado: {{ importResult.format }}</b>
          </div>
          <p class="m-t-1 m-b-0">
            {{ importResult.count }} campos importados:
            <span>{{ importResult.fieldNames.join(', ') }}</span>
          </p>
          <p class="m-t-1 m-b-0" style="font-size: 0.85em">
            Revisa los campos en el formulario y haz clic en "Actualizar" para guardar.
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="importError && !importando"
          class="fondo-color-error texto-color-error p-3 borde-redondeado-16 m-t-2"
        >
          <div class="flex" style="gap: 0.4rem; align-items: center">
            <span class="pictograma-alerta" aria-hidden="true" />
            <b>Error al importar</b>
          </div>
          <p class="m-t-1 m-b-0">{{ importError }}</p>
        </div>
      </div>
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
            <!-- Selector 1: Categoría OGC -->
            <SisdaiSelector v-model="categoriaOGC" etiqueta="Categoría OGC *">
              <option value="">Selecciona una categoría OGC</option>
              <option
                v-for="value in dictCategoriaOGC"
                :key="Object.keys(value)[0]"
                :value="Object.keys(value)[0]"
              >
                {{ value[Object.keys(value)[0]] }}
              </option>
            </SisdaiSelector>

            <!-- Selector 2: Categoría SIGIC -->
            <SisdaiSelector v-model="categoriaSIGIC" class="m-t-3" etiqueta="Categoría SIGIC *">
              <option value="">Selecciona una categoría SIGIC</option>
              <option
                v-for="value in dictCategoriaSIGIC"
                :key="Object.keys(value)[0]"
                :value="Object.keys(value)[0]"
              >
                {{ value[Object.keys(value)[0]] }}
              </option>
            </SisdaiSelector>

            <!-- Selector 3: tipo de visualización ha sido eliminado-->
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
