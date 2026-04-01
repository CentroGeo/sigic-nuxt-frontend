<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { dictIdiomas } from '~/utils/catalogo';

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
const seleccionIdioma = computed({
  get: () => storeMetadatos.metadata.language,
  set: (value) => storeMetadatos.updateAttr('language', value),
});
const seleccionLicencia = computed({
  get: () => storeMetadatos.metadata.license,
  set: (value) => storeMetadatos.updateAttr('license', value),
});
const campoAtribucion = computed({
  get: () => storeMetadatos.metadata.attribution,
  set: (value) => storeMetadatos.updateAttr('attribution', value),
});
//const seleccionRegiones = ref('');
const campoEstadoCalidadDatos = computed({
  get: () => storeMetadatos.metadata.data_quality_statement,
  set: (value) => storeMetadatos.updateAttr('data_quality_statement', value),
});
const seleccionRestricciones = computed({
  get: () => storeMetadatos.metadata.restriction_code_type,
  set: (value) => storeMetadatos.updateAttr('restriction_code_type', value),
});
const campoOtrasRestricciones = computed({
  get: () => storeMetadatos.metadata.constraints_other,
  set: (value) => storeMetadatos.updateAttr('constraints_other', value),
});

const dictLicencia = [
  { not_specified: 'No especificado(a)' },
  { varied_original: 'Varios / Original' },
  { varied_derived: 'Varios / Derivados(as)' },
  { public_domain: 'Dominio público' },
  { public_domain_usg: 'Dominio público / Gobierno de EUA' },
  { odbl: 'Licencia abierta de bases de datos abiertos' },
  { nextview: 'NextView' },
];

const dictRestricciones = [
  {
    copyright: `Derecho exclusivo a la publicación, producción o venta de los derechos de una obra literaria, 
    dramática, musical o artística, o al uso de una marca o etiqueta comercial, otorgado por la ley 
    durante un periodo específico de tiempo a la persona autora, compositora, artista o distribuidora.`,
  },
  {
    patent: `El gobierno ha otorgado el derecho exclusivo de hacer, vender, usar u otorgar licencia de patente 
    de alguna invención o descubrimiento.`,
  },
  {
    patentPending: `Información producida o vendida en espera de recibir una patente.`,
  },
  {
    trademark: `El nombre, símbolo u otro dispositivo que identifique a un producto. Éste debe estar registrado 
    oficialmente y su uso está limitado jurídicamente al dueño o fabricante del producto.`,
  },
  { license: 'Permiso formal para hacer algo.' },
  {
    intellectualPropertyRights: `Derechos para controlar y lucrar con la distribución de propiedad no tangible 
    proveniente de actividades creativas.`,
  },
  {
    restricted: 'No se permite su circulación en general.',
  },
  {
    otherRestrictions: 'Otras restricciones.',
  },
];
</script>
<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Ubicación y Licencias'"
      :exclude-links="props.isModal"
    />
    <p class="m-t-2 m-b-0">* Campos obligatorios</p>

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex">
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector v-model="seleccionIdioma" etiqueta="Idioma*">
              <option
                v-for="value in dictIdiomas"
                :key="Object.keys(value)"
                :value="Object.keys(value)"
              >
                {{ value[Object.keys(value)] }}
              </option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector v-model="seleccionLicencia" etiqueta="Licencia*">
              <!--<option value="">---------</option> -->
              <option
                v-for="value in dictLicencia"
                :key="Object.keys(value)"
                :value="Object.keys(value)"
              >
                {{ value[Object.keys(value)] }}
              </option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoAtribucion"
              etiqueta="Autores o Institución*"
              ejemplo="Autoridad o función otorgada, ej. gobernante, delegada/o, o similar"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="tarjeta fondo-color-informacion texto-color-informacion">
          <div class="tarjeta-cuerpo">
            <p class="tarjeta-titulo texto-color-informacion">
              <span class="pictograma-informacion"></span>Declaración de calidad de datos y los
              paneles de Restricciones
            </p>
            <p class="texto-color-informacion">
              Permiten insertar código HTML a través de un editor de texto wysiwyg
            </p>
          </div>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoEstadoCalidadDatos"
              etiqueta="Estado de calidad de datos"
              ejemplo="Explicación general del conocimiento del productor de datos sobre el linaje de un conjunto de datos"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector
              v-model="seleccionRestricciones"
              etiqueta="Restricciones"
              class="selector-restricciones"
            >
              <option value="">----</option>
              <option
                v-for="value in dictRestricciones"
                :key="Object.keys(value)"
                :value="Object.keys(value)"
              >
                {{ value[Object.keys(value)] }}
              </option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoOtrasRestricciones"
              etiqueta="Otras restricciones"
              ejemplo="Agua, educación, conservación..."
            />
          </ClientOnly>
        </div>
      </div>

      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`2-${props.resourcePk}-buttons`"
        :resource="props.recurso"
        :title="'UbicacionLicencias'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      />
    </div>
  </div>
</template>
