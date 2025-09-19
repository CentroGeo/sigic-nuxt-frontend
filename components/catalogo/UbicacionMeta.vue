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

const seleccionIdioma = ref('');
const seleccionLicencia = ref('');
const campoAtribucion = ref('');
const seleccionRegiones = ref('');
const campoEstadoCalidadDatos = ref('');
const seleccionRestricciones = ref('');
const campoOtrasRestricciones = ref('');

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
              <option value="abk">Abkhazian</option>
              <option value="aar">Afar</option>
              <option value="afr">Afrikaans</option>
              <option value="amh">Amharic</option>
              <option value="ara">Arabic</option>
              <option value="asm">Assamese</option>
              <option value="aym">Aymara</option>
              <option value="aze">Azerbaijani</option>
              <option value="bak">Bashkir</option>
              <option value="ben">Bengali</option>
              <option value="bih">Bihari</option>
              <option value="bis">Bislama</option>
              <option value="bre">Breton</option>
              <option value="bul">Bulgarian</option>
              <option value="bel">Byelorussian</option>
              <option value="cat">Catalan</option>
              <option value="chi">Chinese</option>
              <option value="cos">Corsican</option>
              <option value="dan">Danish</option>
              <option value="dzo">Dzongkha</option>
              <option value="eng" selected="">English</option>
              <option value="fra">French</option>
              <option value="epo">Esperanto</option>
              <option value="est">Estonian</option>
              <option value="fao">Faroese</option>
              <option value="fij">Fijian</option>
              <option value="fin">Finnish</option>
              <option value="fry">Frisian</option>
              <option value="glg">Gallegan</option>
              <option value="ger">German</option>
              <option value="gre">Greek</option>
              <option value="kal">Greenlandic</option>
              <option value="grn">Guarani</option>
              <option value="guj">Gujarati</option>
              <option value="hau">Hausa</option>
              <option value="heb">Hebrew</option>
              <option value="hin">Hindi</option>
              <option value="hun">Hungarian</option>
              <option value="ind">Indonesian</option>
              <option value="ina">
                Interlingua (International Auxiliary language Association)
              </option>
              <option value="iku">Inuktitut</option>
              <option value="ipk">Inupiak</option>
              <option value="ita">Italian</option>
              <option value="jpn">Japanese</option>
              <option value="kan">Kannada</option>
              <option value="kas">Kashmiri</option>
              <option value="kaz">Kazakh</option>
              <option value="khm">Khmer</option>
              <option value="kin">Kinyarwanda</option>
              <option value="kir">Kirghiz</option>
              <option value="kor">Korean</option>
              <option value="kur">Kurdish</option>
              <option value="oci">Langue d 'Oc (post 1500)</option>
              <option value="lao">Lao</option>
              <option value="lat">Latin</option>
              <option value="lav">Latvian</option>
              <option value="lin">Lingala</option>
              <option value="lit">Lithuanian</option>
              <option value="mlg">Malagasy</option>
              <option value="mlt">Maltese</option>
              <option value="mar">Marathi</option>
              <option value="mol">Moldavian</option>
              <option value="mon">Mongolian</option>
              <option value="nau">Nauru</option>
              <option value="nep">Nepali</option>
              <option value="nor">Norwegian</option>
              <option value="ori">Oriya</option>
              <option value="orm">Oromo</option>
              <option value="pan">Panjabi</option>
              <option value="pol">Polish</option>
              <option value="por">Portuguese</option>
              <option value="pus">Pushto</option>
              <option value="que">Quechua</option>
              <option value="roh">Rhaeto-Romance</option>
              <option value="run">Rundi</option>
              <option value="rus">Russian</option>
              <option value="smo">Samoan</option>
              <option value="sag">Sango</option>
              <option value="san">Sanskrit</option>
              <option value="scr">Serbo-Croatian</option>
              <option value="sna">Shona</option>
              <option value="snd">Sindhi</option>
              <option value="sin">Singhalese</option>
              <option value="ssw">Siswant</option>
              <option value="slv">Slovenian</option>
              <option value="som">Somali</option>
              <option value="sot">Sotho</option>
              <option value="spa">Spanish</option>
              <option value="sun">Sudanese</option>
              <option value="swa">Swahili</option>
              <option value="tgl">Tagalog</option>
              <option value="tgk">Tajik</option>
              <option value="tam">Tamil</option>
              <option value="tat">Tatar</option>
              <option value="tel">Telugu</option>
              <option value="tha">Thai</option>
              <option value="tir">Tigrinya</option>
              <option value="tog">Tonga (Nyasa)</option>
              <option value="tso">Tsonga</option>
              <option value="tsn">Tswana</option>
              <option value="tur">Turkish</option>
              <option value="tuk">Turkmen</option>
              <option value="twi">Twi</option>
              <option value="uig">Uighur</option>
              <option value="ukr">Ukrainian</option>
              <option value="urd">Urdu</option>
              <option value="uzb">Uzbek</option>
              <option value="vie">Vietnamese</option>
              <option value="vol">Volapük</option>
              <option value="wol">Wolof</option>
              <option value="xho">Xhosa</option>
              <option value="yid">Yiddish</option>
              <option value="yor">Yoruba</option>
              <option value="zha">Zhuang</option>
              <option value="zul">Zulu</option>
            </SisdaiSelector>
          </ClientOnly>
        </div>
        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector v-model="seleccionLicencia" etiqueta="Licencia">
              <option value="">---------</option>
              <option value="7">NextView</option>
              <option value="1" selected="">Not Specified</option>
              <option value="6">Open Data Commons Open Database License / OSM</option>
              <option value="4">Public Domain</option>
              <option value="5">Public Domain / USG</option>
              <option value="3">Varied / Derived</option>
              <option value="2">Varied / Original</option>
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
        <div class="columna-16">
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
              <option value="" selected="">---------</option>
              <option value="1">
                exclusive right to the publication, production, or sale of the rights to a literary,
                dramatic, musical, or artistic work, or to the use of a commercial print or label,
                granted by law for a specified period of time to an author, composer, artist,
                distributor
              </option>
              <option value="6">
                rights to financial benefit from and control of distribution of non-tangible
                property that is a result of creativity
              </option>
              <option value="5">formal permission to do something</option>
              <option value="8">otherRestrictions</option>
              <option value="2">
                government has granted exclusive right to make, sell, use or license an invention or
                discovery
              </option>
              <option value="3">produced or sold information awaiting a patent</option>
              <option value="7">withheld from general circulation or disclosure</option>
              <option value="4">
                a name, symbol, or other device identifying a product, officially registered and
                legally restricted to the use of the owner or manufacturer
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
