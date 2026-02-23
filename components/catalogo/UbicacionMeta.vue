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
  { abk: 'Abjasio' },
  { aar: 'Afar' },
  { afr: 'Afrikáans' },
  { aym: 'Aimara' },
  { ger: 'Alemán' },
  { amh: 'Amárico' },
  { ara: 'Árabe' },
  { asm: 'Asamés' },
  { aze: 'Azerí' },
  { bak: 'Baskir' },
  { ben: 'Bengalí' },
  { bel: 'Bielorruso' },
  { bih: 'Bihari' },
  { bis: 'Bislama' },
  { bre: 'Bretón' },
  { bul: 'Búlgaro' },
  { kas: 'Cachemir' },
  { kan: 'Canarés' },
  { cat: 'Catalán' },
  { chi: 'Chino' },
  { twi: 'Chuí' },
  { sin: 'Cingalés' },
  { kor: 'Coreano' },
  { cos: 'Corso' },
  { dan: 'Danés' },
  { dzo: 'Dzongkha' },
  { slv: 'Esloveno' },
  { spa: 'Español ' },
  { epo: 'Esperanto' },
  { est: 'Estonio' },
  { fao: 'Faroés' },
  { fin: 'Finés' },
  { fij: 'Fiyiano' },
  { fra: 'Francés ' },
  { fry: 'Frisón' },
  { glg: 'Gallego' },
  { gre: 'Griego' },
  { kal: 'Groenlandés' },
  { grn: 'Guaraní' },
  { guj: 'Guyarati' },
  { hau: 'Hausa' },
  { heb: 'Hebreo ' },
  { hin: 'Hindi' },
  { hun: 'Húngaro' },
  { yid: 'Ídish' },
  { ind: 'Indonesio' },
  { eng: 'Inglés ' },
  { ina: 'Interlingua' },
  { iku: 'Inuktitut' },
  { ita: 'Italiano' },
  { ipk: 'Iñupiaq' },
  { jpn: 'Japonés ' },
  { khm: 'Jemer' },
  { kaz: 'Kazajo' },
  { kir: 'Kirguís' },
  { run: 'Kirundi' },
  { kin: 'Kiñaruanda' },
  { kur: 'Kurdo' },
  { lao: 'Laosiano' },
  { lat: 'Latín' },
  { lav: 'Letón' },
  { lin: 'Lingala' },
  { lit: 'Lituano' },
  { mlg: 'Malgache' },
  { mlt: 'Maltés' },
  { mar: 'Maratí' },
  { mol: 'Moldavo' },
  { mon: 'Mongol' },
  { nau: 'Nauruano' },
  { nep: 'Nepalí' },
  { nor: 'Noruego' },
  { oci: 'Occitano' },
  { ori: 'Odia' },
  { orm: 'Oromo' },
  { pus: 'Pastún' },
  { pol: 'Polaco' },
  { por: 'Portugués' },
  { pan: 'Punyabí' },
  { que: 'Quechua' },
  { roh: 'Retorrománico' },
  { rus: 'Ruso ' },
  { smo: 'Samoano' },
  { sag: 'Sango' },
  { scr: 'Serbocroata' },
  { sot: 'Sesotho' },
  { tsn: 'Setsuana' },
  { sna: 'Shona' },
  { snd: 'Sindi' },
  { som: 'Somalí' },
  { swa: 'Suajili' },
  { ssw: 'Suazi' },
  { sun: 'Sudanés' },
  { san: 'Sánscrito' },
  { tgl: 'Tagalo' },
  { tha: 'Tailandés' },
  { tam: 'Tamil' },
  { tgk: 'Tayiko' },
  { tir: 'Tigriña' },
  { tog: 'Tongano' },
  { tso: 'Tsonga' },
  { tur: 'Turco' },
  { tuk: 'Turcomano' },
  { tat: 'Tártaro' },
  { tel: 'Télugu' },
  { ukr: 'Ucraniano' },
  { uig: 'Uigur' },
  { urd: 'Urdu' },
  { uzb: 'Uzbeko' },
  { vie: 'Vietnamita' },
  { vol: 'Volapük' },
  { wol: 'Wólof' },
  { xho: 'Xhosa' },
  { yor: 'Yoruba' },
  { zha: 'Zhuang' },
  { zul: 'Zulu' },
];

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
            <SisdaiSelector v-model="seleccionRestricciones" etiqueta="Restricciones">
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
