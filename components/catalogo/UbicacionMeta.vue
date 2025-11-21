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
// const storeCatalogo = useCatalogoStore();
// console.log('props.recurso', props.recurso);
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

const dictIdiomas = [
  { abk: 'Abkhazian' },
  { aar: 'Afar' },
  { afr: 'Afrikaans' },
  { amh: 'Amharic' },
  { ara: 'Arabic' },
  { asm: 'Assamese' },
  { aym: 'Aymara' },
  { aze: 'Azerbaijani' },
  { bak: 'Bashkir' },
  { ben: 'Bengali' },
  { bih: 'Bihari' },
  { bis: 'Bislama' },
  { bre: 'Breton' },
  { bul: 'Bulgarian' },
  { bel: 'Byelorussian' },
  { cat: 'Catalan' },
  { chi: 'Chinese' },
  { cos: 'Corsican' },
  { dan: 'Danish' },
  { dzo: 'Dzongkha' },
  { eng: 'English' },
  { fra: 'French' },
  { epo: 'Esperanto' },
  { est: 'Estonian' },
  { fao: 'Faroese' },
  { fij: 'Fijian' },
  { fin: 'Finnish' },
  { fry: 'Frisian' },
  { glg: 'Gallegan' },
  { ger: 'German' },
  { gre: 'Greek' },
  { kal: 'Greenlandic' },
  { grn: 'Guarani' },
  { guj: 'Gujarati' },
  { hau: 'Hausa' },
  { heb: 'Hebrew' },
  { hin: 'Hindi' },
  { hun: 'Hungarian' },
  { ind: 'Indonesian' },
  { ina: 'Interlingua (International Auxiliary language Association)' },
  { iku: 'Inuktitut' },
  { ipk: 'Inupiak' },
  { ita: 'Italian' },
  { jpn: 'Japanese' },
  { kan: 'Kannada' },
  { kas: 'Kashmiri' },
  { kaz: 'Kazakh' },
  { khm: 'Khmer' },
  { kin: 'Kinyarwanda' },
  { kir: 'Kirghiz' },
  { kor: 'Korean' },
  { kur: 'Kurdish' },
  { oci: `Langue d 'Oc (post 1500)` },
  { lao: 'Lao' },
  { lat: 'Latin' },
  { lav: 'Latvian' },
  { lin: 'Lingala' },
  { lit: 'Lithuanian' },
  { mlg: 'Malagasy' },
  { mlt: 'Maltese' },
  { mar: 'Marathi' },
  { mol: 'Moldavian' },
  { mon: 'Mongolian' },
  { nau: 'Nauru' },
  { nep: 'Nepali' },
  { nor: 'Norwegian' },
  { ori: 'Oriya' },
  { orm: 'Oromo' },
  { pan: 'Panjabi' },
  { pol: 'Polish' },
  { por: 'Portuguese' },
  { pus: 'Pushto' },
  { que: 'Quechua' },
  { roh: 'Rhaeto-Romance' },
  { run: 'Rundi' },
  { rus: 'Russian' },
  { smo: 'Samoan' },
  { sag: 'Sango' },
  { san: 'Sanskrit' },
  { scr: 'Serbo-Croatian' },
  { sna: 'Shona' },
  { snd: 'Sindhi' },
  { sin: 'Singhalese' },
  { ssw: 'Siswant' },
  { slv: 'Slovenian' },
  { som: 'Somali' },
  { sot: 'Sotho' },
  { spa: 'Spanish' },
  { sun: 'Sudanese' },
  { swa: 'Swahili' },
  { tgl: 'Tagalog' },
  { tgk: 'Tajik' },
  { tam: 'Tamil' },
  { tat: 'Tatar' },
  { tel: 'Telugu' },
  { tha: 'Thai' },
  { tir: 'Tigrinya' },
  { tog: 'Tonga (Nyasa)' },
  { tso: 'Tsonga' },
  { tsn: 'Tswana' },
  { tur: 'Turkish' },
  { tuk: 'Turkmen' },
  { twi: 'Twi' },
  { uig: 'Uighur' },
  { ukr: 'Ukrainian' },
  { urd: 'Urdu' },
  { uzb: 'Uzbek' },
  { vie: 'Vietnamese' },
  { vol: 'Volapük' },
  { wol: 'Wolof' },
  { xho: 'Xhosa' },
  { yid: 'Yiddish' },
  { yor: 'Yoruba' },
  { zha: 'Zhuang' },
  { zul: 'Zulu' },
];
/* const dictLicencia = [
  { 1: 'Not Specified' },
  { 2: 'Varied / Original' },
  { 3: 'Varied / Derived' },
  { 4: 'Public Domain' },
  { 5: 'Public Domain / USG' },
  { 6: 'Open Data Commons Open Database License / OSM' },
  { 7: 'NextView' },
]; */
const dictLicencia = [
  { not_specified: 'Not Specified' },
  { varied_original: 'Varied / Original' },
  { varied_derived: 'Varied / Derived' },
  { public_domain: 'Public Domain' },
  { public_domain_usg: 'Public Domain / USG' },
  { odbl: 'Open Data Commons Open Database License / OSM' },
  { nextview: 'NextView' },
];
/* const dictRestricciones = [
  {
    1: 'exclusive right to the publication, production, or sale of the rights to a literary, dramatic, musical, or artistic work, or to the use of a commercial print or label, granted by law for a specified period of time to an author, composer, artist, distributor',
  },
  {
    2: 'government has granted exclusive right to make, sell, use or license an invention or discovery',
  },
  {
    3: 'produced or sold information awaiting a patent',
  },
  {
    4: 'a name, symbol, or other device identifying a product, officially registered and legally restricted to the use of the owner or manufacturer',
  },
  { 5: 'formal permission to do something' },
  {
    6: 'rights to financial benefit from and control of distribution of non-tangible property that is a result of creativity',
  },
  {
    7: 'withheld from general circulation or disclosure',
  },
  {
    8: 'otherRestrictions',
  },
]; */

const dictRestricciones = [
  {
    copyright:
      'exclusive right to the publication, production, or sale of the rights to a literary, dramatic, musical, or artistic work, or to the use of a commercial print or label, granted by law for a specified period of time to an author, composer, artist, distributor',
  },
  {
    patent:
      'government has granted exclusive right to make, sell, use or license an invention or discovery',
  },
  {
    patentPending: 'produced or sold information awaiting a patent',
  },
  {
    trademark:
      'a name, symbol, or other device identifying a product, officially registered and legally restricted to the use of the owner or manufacturer',
  },
  { license: 'formal permission to do something' },
  {
    intellectualPropertyRights:
      'rights to financial benefit from and control of distribution of non-tangible property that is a result of creativity',
  },
  {
    restricted: 'withheld from general circulation or disclosure',
  },
  {
    otherRestrictions: 'otherRestrictions',
  },
];
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
//     seleccionIdioma,
//     seleccionLicencia,
//     campoAtribucion,
//     seleccionRegiones,
//     campoEstadoCalidadDatos,
//     seleccionRestricciones,
//     campoOtrasRestricciones,
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
      :title="'Ubicación y Licencias'"
      :exclude-links="props.isModal"
    />

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex">
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector v-model="seleccionIdioma" etiqueta="Idioma">
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
            <SisdaiSelector v-model="seleccionLicencia" etiqueta="Licencia">
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
              etiqueta="Atribución"
              ejemplo="Autoridad o función otorgada, ej. gobernante, delegada/o, o similar"
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>
        <!--         <div class="columna-16">
          <ClientOnly>
            <SisdaiSelector v-model="seleccionRegiones" etiqueta="Regiones">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </SisdaiSelector>
          </ClientOnly>
          <div class="texto-color-informacion fondo-color-informacion borde-redondeado-8 p-2 m-t-2">
            <p class="m-t-0 m-b-1 texto-peso-600">
              <span class="pictograma-informacion" /> Declaración de calidad de datos y los paneles
              de Restricciones
            </p>
            <p class="m-0">Permiten insetar código HTML a través de un editor de texto wysiwyg</p>
          </div>
        </div> -->
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
            <SisdaiSelector v-model="seleccionRestricciones" etiqueta="Restricciones">
              <!--               <option value="" selected="">---------</option> -->
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
