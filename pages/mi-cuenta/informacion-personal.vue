<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'auth',
});

const config = useRuntimeConfig();
const { data } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const isLoading = ref(true);
const isUpdating = ref(false);
const status = ref('read');
const modalUpdateInfo = ref(null);
const wasUpdateSuccesful = ref(null);
const editableFields = [
  'first_name',
  'last_name',
  'organization',
  'department',
  'position',
  'city',
  'state',
  'postal_code',
];
const tagsDict = {
  first_name: 'Nombre',
  last_name: 'Apellidos',
  email: 'Dirección de correo electrónico',
  organization: 'Nombre de la organización',
  department: 'Laboratorio, Área o Departamento',
  position: 'Posición',
  city: 'Ciudad',
  state: 'Entidad o provincia',
  postal_code: 'Código Postal',
  country: 'País',
};
const countriesDict = {
  ABW: 'Aruba',
  AFG: 'Afghanistan',
  AGO: 'Angola',
  AIA: 'Anguilla',
  ALA: 'Åland Islands',
  ALB: 'Albania',
  AND: 'Andorra',
  ARE: 'United Arab Emirates',
  ARG: 'Argentina',
  ARM: 'Armenia',
  ASM: 'American Samoa',
  ATA: 'Antarctica',
  ATF: 'French Southern Territories',
  ATG: 'Antigua and Barbuda',
  AUS: 'Australia',
  AUT: 'Austria',
  AZE: 'Azerbaijan',
  BDI: 'Burundi',
  BEL: 'Belgium',
  BEN: 'Benin',
  BES: 'Bonaire, Sint Eustatius and Saba',
  BFA: 'Burkina Faso',
  BGD: 'Bangladesh',
  BGR: 'Bulgaria',
  BHR: 'Bahrain',
  BHS: 'Bahamas',
  BIH: 'Bosnia and Herzegovina',
  BLM: 'Saint Barthélemy',
  BLR: 'Belarus',
  BLZ: 'Belize',
  BMU: 'Bermuda',
  BOL: 'Bolivia, Plurinational State of',
  BRA: 'Brazil',
  BRB: 'Barbados',
  BRN: 'Brunei Darussalam',
  BTN: 'Bhutan',
  BVT: 'Bouvet Island',
  BWA: 'Botswana',
  CAF: 'Central African Republic',
  CAN: 'Canada',
  CCK: 'Cocos (Keeling) Islands',
  CHE: 'Switzerland',
  CHL: 'Chile',
  CHN: 'China',
  CIV: "Côte d'Ivoire",
  CMR: 'Cameroon',
  COD: 'Congo, Democratic Republic of the',
  COG: 'Congo',
  COK: 'Cook Islands',
  COL: 'Colombia',
  COM: 'Comoros',
  CPV: 'Cabo Verde',
  CRI: 'Costa Rica',
  CUB: 'Cuba',
  CUW: 'Curaçao',
  CXR: 'Christmas Island',
  CYM: 'Cayman Islands',
  CYP: 'Cyprus',
  CZE: 'Czechia',
  DEU: 'Germany',
  DJI: 'Djibouti',
  DMA: 'Dominica',
  DNK: 'Denmark',
  DOM: 'Dominican Republic',
  DZA: 'Algeria',
  ECU: 'Ecuador',
  EGY: 'Egypt',
  ERI: 'Eritrea',
  ESH: 'Western Sahara',
  ESP: 'Spain',
  EST: 'Estonia',
  ETH: 'Ethiopia',
  FIN: 'Finland',
  FJI: 'Fiji',
  FLK: 'Falkland Islands (Malvinas)',
  FRA: 'France',
  FRO: 'Faroe Islands',
  FSM: 'Micronesia, Federated States of',
  GAB: 'Gabon',
  GBR: 'United Kingdom of Great Britain and Northern Ireland',
  GEO: 'Georgia',
  GGY: 'Guernsey',
  GHA: 'Ghana',
  GIB: 'Gibraltar',
  GIN: 'Guinea',
  GLP: 'Guadeloupe',
  GMB: 'Gambia',
  GNB: 'Guinea-Bissau',
  GNQ: 'Equatorial Guinea',
  GRC: 'Greece',
  GRD: 'Grenada',
  GRL: 'Greenland',
  GTM: 'Guatemala',
  GUF: 'French Guiana',
  GUM: 'Guam',
  GUY: 'Guyana',
  HKG: 'Hong Kong',
  HMD: 'Heard Island and McDonald Islands',
  HND: 'Honduras',
  HRV: 'Croatia',
  HTI: 'Haiti',
  HUN: 'Hungary',
  IDN: 'Indonesia',
  IMN: 'Isle of Man',
  IND: 'India',
  IOT: 'British Indian Ocean Territory',
  IRL: 'Ireland',
  IRN: 'Iran, Islamic Republic of',
  IRQ: 'Iraq',
  ISL: 'Iceland',
  ISR: 'Israel',
  ITA: 'Italy',
  JAM: 'Jamaica',
  JEY: 'Jersey',
  JOR: 'Jordan',
  JPN: 'Japan',
  KAZ: 'Kazakhstan',
  KEN: 'Kenya',
  KGZ: 'Kyrgyzstan',
  KHM: 'Cambodia',
  KIR: 'Kiribati',
  KNA: 'Saint Kitts and Nevis',
  KOR: 'Korea, Republic of',
  KWT: 'Kuwait',
  LAO: "Lao People's Democratic Republic",
  LBN: 'Lebanon',
  LBR: 'Liberia',
  LBY: 'Libya',
  LCA: 'Saint Lucia',
  LIE: 'Liechtenstein',
  LKA: 'Sri Lanka',
  LSO: 'Lesotho',
  LTU: 'Lithuania',
  LUX: 'Luxembourg',
  LVA: 'Latvia',
  MAC: 'Macao',
  MAF: 'Saint Martin (French part)',
  MAR: 'Morocco',
  MCO: 'Monaco',
  MDA: 'Moldova, Republic of',
  MDG: 'Madagascar',
  MDV: 'Maldives',
  MEX: 'Mexico',
  MHL: 'Marshall Islands',
  MKD: 'North Macedonia',
  MLI: 'Mali',
  MLT: 'Malta',
  MMR: 'Myanmar',
  MNE: 'Montenegro',
  MNG: 'Mongolia',
  MNP: 'Northern Mariana Islands',
  MOZ: 'Mozambique',
  MRT: 'Mauritania',
  MSR: 'Montserrat',
  MTQ: 'Martinique',
  MUS: 'Mauritius',
  MWI: 'Malawi',
  MYS: 'Malaysia',
  MYT: 'Mayotte',
  NAM: 'Namibia',
  NCL: 'New Caledonia',
  NER: 'Niger',
  NFK: 'Norfolk Island',
  NGA: 'Nigeria',
  NIC: 'Nicaragua',
  NIU: 'Niue',
  NLD: 'Netherlands, Kingdom of the',
  NOR: 'Norway',
  NPL: 'Nepal',
  NRU: 'Nauru',
  NZL: 'New Zealand',
  OMN: 'Oman',
  PAK: 'Pakistan',
  PAN: 'Panama',
  PCN: 'Pitcairn',
  PER: 'Peru',
  PHL: 'Philippines',
  PLW: 'Palau',
  PNG: 'Papua New Guinea',
  POL: 'Poland',
  PRI: 'Puerto Rico',
  PRK: "Korea, Democratic People's Republic of",
  PRT: 'Portugal',
  PRY: 'Paraguay',
  PSE: 'Palestine, State of',
  PYF: 'French Polynesia',
  QAT: 'Qatar',
  REU: 'Réunion',
  ROU: 'Romania',
  RUS: 'Russian Federation',
  RWA: 'Rwanda',
  SAU: 'Saudi Arabia',
  SDN: 'Sudan',
  SEN: 'Senegal',
  SGP: 'Singapore',
  SGS: 'South Georgia and the South Sandwich Islands',
  SHN: 'Saint Helena, Ascension and Tristan da Cunha',
  SJM: 'Svalbard and Jan Mayen',
  SLB: 'Solomon Islands',
  SLE: 'Sierra Leone',
  SLV: 'El Salvador',
  SMR: 'San Marino',
  SOM: 'Somalia',
  SPM: 'Saint Pierre and Miquelon',
  SRB: 'Serbia',
  SSD: 'South Sudan',
  STP: 'Sao Tome and Principe',
  SUR: 'Suriname',
  SVK: 'Slovakia',
  SVN: 'Slovenia',
  SWE: 'Sweden',
  SWZ: 'Eswatini',
  SXM: 'Sint Maarten (Dutch part)',
  SYC: 'Seychelles',
  SYR: 'Syrian Arab Republic',
  TCA: 'Turks and Caicos Islands',
  TCD: 'Chad',
  TGO: 'Togo',
  THA: 'Thailand',
  TJK: 'Tajikistan',
  TKL: 'Tokelau',
  TKM: 'Turkmenistan',
  TLS: 'Timor-Leste',
  TON: 'Tonga',
  TTO: 'Trinidad and Tobago',
  TUN: 'Tunisia',
  TUR: 'Türkiye',
  TUV: 'Tuvalu',
  TWN: 'Taiwan, Province of China',
  TZA: 'Tanzania, United Republic of',
  UGA: 'Uganda',
  UKR: 'Ukraine',
  UMI: 'United States Minor Outlying Islands',
  URY: 'Uruguay',
  USA: 'United States of America',
  UZB: 'Uzbekistan',
  VAT: 'Holy See',
  VCT: 'Saint Vincent and the Grenadines',
  VEN: 'Venezuela, Bolivarian Republic of',
  VGB: 'Virgin Islands (British)',
  VIR: 'Virgin Islands (U.S.)',
  VNM: 'Viet Nam',
  VUT: 'Vanuatu',
  WLF: 'Wallis and Futuna',
  WSM: 'Samoa',
  YEM: 'Yemen',
  ZAF: 'South Africa',
  ZMB: 'Zambia',
  ZWE: 'Zimbabwe',
};

const userInfo = ref({
  first_name: null,
  last_name: null,
  email: null,
  organization: null,
  department: null,
  position: null,
  city: null,
  state: null,
  postal_code: null,
  country: null,
});

function toggleStatus() {
  if (status.value === 'read') {
    status.value = 'edit';
  } else {
    status.value = 'read';
  }
}

async function fetchData() {
  const url = `${config.public.geonodeApi}/account/me/profile/`;
  const infoRequest = await gnoxyFetch(url);
  const info = await infoRequest.json();
  userInfo.value['first_name'] = info.first_name || 'No suministrado';
  userInfo.value['last_name'] = info.last_name || 'No suministrado';
  userInfo.value['email'] = info.email || 'No suministrado';
  userInfo.value['organization'] = info.organization || 'No suministrado';
  userInfo.value['department'] = info.department || 'No suministrado';
  userInfo.value['position'] = info.position || 'No suministrado';
  userInfo.value['city'] = info.city || 'No suministrado';
  userInfo.value['state'] = info.state || 'No suministrado';
  userInfo.value['postal_code'] = info.postal_code || 'No suministrado';
  userInfo.value['country'] = info.country || 'No suministrado';
  isLoading.value = false;
}

async function updateInfo() {
  wasUpdateSuccesful.value = null;
  isUpdating.value = true;
  modalUpdateInfo.value?.abrirModal();
  const invalidValues = ['', 'No suministrado'];
  const token = data.value?.accessToken;
  const body = {};

  for (const key of Object.keys(userInfo.value)) {
    if (invalidValues.includes(userInfo.value[key].trim())) {
      body[key] = null;
    } else {
      body[key] = userInfo.value[key];
    }
  }
  const response = await $fetch('/api/info-personal', {
    method: 'POST',
    headers: { token: token },
    body: body,
  });
  if (response === 'ok') {
    await fetchData();
  }
  wasUpdateSuccesful.value = response === 'ok' ? true : false;
  isUpdating.value = false;
}

onMounted(async () => {
  fetchData();
});
</script>
<template>
  <div>
    <h2>Información personal</h2>
    <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
      <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
    </div>
    <div v-else class="flex columna-4">
      <div class="columna-4" style="text-align: center">
        <img src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg" />
        <a class="m-t-1">Cambiar foto</a>
      </div>

      <div v-if="status === 'read'" class="columna-12">
        <div v-for="(campo, index) in Object.keys(userInfo)" :key="index" class="m-b-2">
          <label class="m-0">{{ tagsDict[campo] }}</label>
          <p class="m-0">{{ userInfo[campo] }}</p>
        </div>
        <div class="flex m-y-6">
          <button
            class="boton-secundario boton-chico"
            aria-label="Editar Información"
            @click="toggleStatus"
          >
            Editar Información <span class="pictograma-editar"></span>
          </button>
        </div>
      </div>
      <div v-if="status === 'edit'" class="columna-12">
        <ClientOnly>
          <SisdaiCampoBase
            v-for="(campo, index) in editableFields"
            :key="index"
            v-model="userInfo[campo]"
            :etiqueta="tagsDict[campo]"
            :ejemplo="userInfo[campo]"
            tipo="text"
            class="m-b-2"
          />
          <SisdaiSelector
            v-model="userInfo['country']"
            :etiqueta="tagsDict['country']"
            class="m-b-2"
          >
            <option :value="null">No suministrado</option>
            <option v-for="country in Object.keys(countriesDict)" :key="country" :value="country">
              {{ countriesDict[country] }}
            </option>
          </SisdaiSelector>
        </ClientOnly>

        <div class="flex m-y-6">
          <button class="boton-secundario boton-chico" aria-label="Cancelar" @click="toggleStatus">
            Cancelar
          </button>
          <button
            class="boton-primario boton-chico"
            aria-label="Guardar Cambios"
            @click="updateInfo"
          >
            Guardar Cambios <span class="pictograma-guardar"></span>
          </button>
        </div>
      </div>
    </div>

    <ClientOnly>
      <SisdaiModal ref="modalUpdateInfo">
        <template #encabezado>
          <h1 v-if="isUpdating">Procesando</h1>
          <p v-else></p>
        </template>
        <template #cuerpo>
          <div v-if="isUpdating" class="m-y-2">
            <div class="flex flex-contenido-centrado">
              <img
                src="/img/loader.gif"
                class="color-invertir"
                alt="...Guardando"
                heigh="160px"
                width="160px"
              />
            </div>
            <p style="text-align: center">Guardando</p>
          </div>
          <div v-if="wasUpdateSuccesful === true" class="flex" style="gap: 0px">
            <p
              class="columna-14 texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion p-2 borde-redondeado-8"
            >
              <span class="pictograma-aprobado" /> Actualización exitosa.
            </p>
          </div>

          <div v-if="wasUpdateSuccesful === false" class="flex" style="gap: 0px">
            <p
              class="columna-14 texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
            >
              <span class="pictograma-alerta" /> No pudimos actualizar la información. Revisa tu
              conexión e intentalo de nuevo más tarde.
            </p>
          </div>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>
<style lang="scss" scoped>
img {
  border-radius: 50%;
  object-fit: contain;
}
</style>
