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
const dragNdropAvatar = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
const failedFetching = ref(false);
const isUpdating = ref(false);
const wasAvatarUpdated = ref(false);
const isAvatarUpdating = ref(false);
const didAvatarUpdateFail = ref(null);
const status = ref('read');
const modalUpdateInfo = ref(null);
const modalUpdateAvatar = ref(null);
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
  AFG: 'Afganistán',
  AGO: 'Angola',
  ALB: 'Albania',
  AND: 'Andorra',
  ARE: 'Emiratos Árabes Unidos',
  ARG: 'Argentina',
  ARM: 'Armenia',
  ATG: 'Antigua y Barbuda',
  AUS: 'Australia',
  AUT: 'Austria',
  AZE: 'Azerbaiyán',
  BDI: 'Burundi',
  BEL: 'Bélgica',
  BEN: 'Benin',
  BFA: 'Burkina Faso',
  BGD: 'Bangladesh',
  BGR: 'Bulgaria',
  BHR: 'Bahréin',
  BHS: 'Bahamas',
  BIH: 'Bosnia y Herzegovina',
  BLR: 'Bielorrusia',
  BLZ: 'Belice',
  BOL: 'Bolivia',
  BRA: 'Brasil',
  BRB: 'Barbados',
  BRN: 'Brunéi',
  BTN: 'Bhután',
  BWA: 'Botswana',
  CAF: 'República Centroafricana',
  CAN: 'Canadá',
  CHE: 'Suiza',
  CHL: 'Chile',
  CHN: 'China',
  CIV: 'Costa de Marfil',
  CMR: 'Camerún',
  COD: 'República Democrática del Congo',
  COG: 'República del Congo',
  COL: 'Colombia',
  COM: 'Comoras',
  CPV: 'Cabo Verde',
  CRI: 'Costa Rica',
  CUB: 'Cuba',
  CYP: 'Chipre',
  CZE: 'República Checa',
  DEU: 'Alemania',
  DJI: 'Djibouti',
  DMA: 'Dominica',
  DNK: 'Dinamarca',
  DOM: 'República Dominicana',
  DZA: 'Argelia',
  ECU: 'Ecuador',
  EGY: 'Egipto',
  ERI: 'Eritrea',
  ESP: 'España',
  EST: 'Estonia',
  ETH: 'Etiopía',
  FIN: 'Finlandia',
  FJI: 'Fiji',
  FRA: 'Francia',
  FSM: 'Estados Federados de Micronesia',
  GAB: 'Gabón',
  GBR: 'Reino Unido',
  GEO: 'Georgia',
  GHA: 'Ghana',
  GIN: 'Guinea',
  GMB: 'Gambia',
  GNB: 'Guinea-Bissau',
  GNQ: 'Guinea Ecuatorial',
  GRC: 'Grecia',
  GRD: 'Granada',
  GRL: 'Groenlandia',
  GTM: 'Guatemala',
  GUY: 'Guyana',
  HND: 'Honduras',
  HRV: 'Croacia',
  HTI: 'Haití',
  HUN: 'Hungría',
  IDN: 'Indonesia',
  IND: 'República de la India',
  IRL: 'Irlanda',
  IRN: 'República Islámica del Irán',
  IRQ: 'Irak',
  ISL: 'Islandia',
  ISR: 'Israel',
  ITA: 'Italia',
  JAM: 'Jamaica',
  JOR: 'Jordania',
  JPN: 'Japón',
  KAZ: 'Kazajistán',
  KEN: 'Kenia',
  KGZ: 'Kirguistán',
  KHM: 'Camboya',
  KIR: 'Kiribati',
  KNA: 'San Cristóbal y Nieves',
  KOR: 'República de Corea',
  KWT: 'Kuwait',
  LAO: 'Laos',
  LBN: 'Líbano',
  LBR: 'Liberia',
  LBY: 'Libia',
  LCA: 'Santa Lucía',
  LIE: 'Liechtenstein',
  LKA: 'Sri Lanka',
  LSO: 'Lesoto',
  LTU: 'Lituania',
  LUX: 'Luxemburgo',
  LVA: 'Letonia',
  MAR: 'Marruecos',
  MCO: 'Mónaco',
  MDA: 'Moldavia',
  MDG: 'Madagascar',
  MDV: 'Maldivas',
  MEX: 'México',
  MHL: 'Islas Marshall',
  MKD: 'Macedonia del Norte',
  MLI: 'Malí',
  MLT: 'Malta',
  MMR: 'Myanmar',
  MNE: 'Montenegro',
  MNG: 'Mongolia',
  MOZ: 'Mozambique',
  MRT: 'Mauritania',
  MUS: 'Mauricio',
  MWI: 'Malawi',
  MYS: 'Malasia',
  NAM: 'Namibia',
  NER: 'Níger',
  NGA: 'Nigeria',
  NIC: 'Nicaragua',
  NIU: 'Niue',
  NLD: 'Países Bajos',
  NOR: 'Noruega',
  NPL: 'Nepal',
  NRU: 'Nauru',
  NZL: 'Nueva Zelanda',
  OMN: 'Omán',
  PAK: 'Pakistán',
  PAN: 'Panamá',
  PER: 'Perú',
  PHL: 'Filipinas',
  PLW: 'Palau',
  PNG: 'Papúa Nueva Guinea',
  POL: 'Polonia',
  PRI: 'Puerto Rico',
  PRK: 'República Popular Democrática de Corea',
  PRT: 'Portugal',
  PRY: 'Paraguay',
  PSE: 'Estado de Palestina',
  QAT: 'Qatar',
  ROU: 'Rumania',
  RUS: 'Federación de Rusia',
  RWA: 'Ruanda',
  SAU: 'Arabia Saudita',
  SDN: 'Sudán',
  SEN: 'Senegal',
  SGP: 'Singapur',
  SLB: 'Islas Salomón',
  SLE: 'Sierra Leona',
  SLV: 'El Salvador',
  SMR: 'San Marino',
  SOM: 'Somalia',
  SRB: 'Serbia',
  SSD: 'Sudán del Sur',
  STP: 'Santo Tomé y Príncipe',
  SUR: 'Surinam',
  SVK: 'Eslovaquia',
  SVN: 'Eslovenia',
  SWE: 'Suecia',
  SWZ: 'Eswatini',
  SYC: 'Seychelles',
  SYR: 'República Árabe Siria',
  TCD: 'Chad',
  TGO: 'Togo',
  THA: 'Tailandia',
  TJK: 'Tayikistán',
  TKM: 'Turkmenistán',
  TLS: 'Timor-Leste',
  TON: 'Tonga',
  TTO: 'Trinidad y Tobago',
  TUN: 'Túnez',
  TUR: 'Turquía',
  TUV: 'Tuvalu',
  TWN: 'Taiwán',
  TZA: 'Tanzania, República Unida de',
  UGA: 'Uganda',
  UKR: 'Ucrania',
  URY: 'Uruguay',
  USA: 'Estados Unidos',
  UZB: 'Uzbekistán',
  VCT: 'San Vicente y las Granadinas',
  VEN: 'República Bolivariana de Venezuela',
  VNM: 'Viet Nam',
  VUT: 'Vanuatu',
  WSM: 'Samoa',
  XKX: 'Kosovo',
  YEM: 'Yemen',
  ZAF: 'Sudáfrica',
  ZMB: 'Zambia',
  ZWE: 'Zimbabue',
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
  avatar_url: null,
});

function toggleStatus() {
  if (status.value === 'read') {
    status.value = 'edit';
  } else {
    status.value = 'read';
  }
}

async function fetchData() {
  failedFetching.value = false;
  const url = `${config.public.geonodeApi}/account/me/profile/`;
  try {
    const infoRequest = await gnoxyFetch(url);
    if (!infoRequest.ok) {
      failedFetching.value = true;
    } else {
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
      userInfo.value['avatar_url'] = info.avatar_url;
    }
  } catch {
    failedFetching.value = true;
  }
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
    if (invalidValues.includes(userInfo.value[key]?.trim())) {
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

function updateAvatar() {
  wasAvatarUpdated.value = false;
  didAvatarUpdateFail.value = null;
  modalUpdateAvatar.value?.abrirModal();
}

async function guardarImagen(files) {
  isAvatarUpdating.value = true;
  wasAvatarUpdated.value = true;
  const { data } = useAuth();
  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    // Enviamos SOLO el primer file
    const formData = new FormData();
    formData.append('token', data.value?.accessToken);
    formData.append('image', files[0]);

    const response = await $fetch('/api/update-avatar/', {
      method: 'POST',
      body: formData,
    });
    if (response === 'Error') {
      didAvatarUpdateFail.value = true;
      isAvatarUpdating.value = false;
    } else {
      userInfo.value.avatar_url = response;
      didAvatarUpdateFail.value = false;
      isAvatarUpdating.value = false;
    }
  } else {
    dragNdropAvatar.value?.archivoNoValido();
  }
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
    <div v-else-if="!isLoading && failedFetching" class="m-t-2 m-b-2">
      <div
        class="fondo-color-error flex flex-contenido-centrado ancho-lectura borde-redondeado-16 sin-seleccion"
      >
        <p class="texto-color-error m-1">
          No se pudo recuperar la información. Revisa tu conexión a internet e intentalo de nuevo
          más tarde.
        </p>
      </div>
    </div>
    <div v-else class="flex columna-4">
      <div class="columna-4" style="text-align: center">
        <img v-if="userInfo.avatar_url" :src="userInfo.avatar_url" />
        <p
          v-else
          style="font-size: 120px"
          class="pictograma-persona texto-color-acento p-0 m-0"
          aria-label="Pictograma de persona"
        ></p>
        <a class="m-t-1" @click="updateAvatar">Cambiar foto</a>
      </div>

      <!--Vista de lectura-->
      <div v-if="status === 'read'" class="columna-12">
        <div
          v-for="(campo, index) in Object.keys(userInfo).filter((d) => d != 'avatar_url')"
          :key="index"
          class="m-b-2"
        >
          <label class="m-0">{{ tagsDict[campo] }}</label>
          <p v-if="campo === 'country' && userInfo[campo] !== 'No suministrado'" class="m-0">
            {{ countriesDict[userInfo['country']] }}
          </p>
          <p v-else class="m-0">
            {{ userInfo[campo] }}
          </p>
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
      <!--Vista de edición-->
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
        </ClientOnly>

        <ClientOnly>
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

    <ClientOnly>
      <SisdaiModal ref="modalUpdateAvatar">
        <template #encabezado>
          <h1>Actualizar avatar</h1>
        </template>
        <template #cuerpo>
          <ClientOnly>
            <CatalogoElementoDragNdDrop
              v-if="!isAvatarUpdating && !wasAvatarUpdated"
              ref="dragNdropAvatar"
              @pasar-archivo="(i) => guardarImagen(i)"
            />
          </ClientOnly>
          <div v-if="isAvatarUpdating" class="m-y-2">
            <div class="flex flex-contenido-centrado">
              <img
                src="/img/loader.gif"
                class="color-invertir"
                alt="...Actualizando Avatar"
                heigh="160px"
                width="160px"
              />
            </div>
            <p style="text-align: center">Actualizando Avatar</p>
          </div>
          <div
            v-if="wasAvatarUpdated && didAvatarUpdateFail === true"
            class="flex"
            style="gap: 0px"
          >
            <p
              class="columna-14 texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
            >
              <span class="pictograma-alerta" /> No pudimos actualizar tu avatar. Revisa tu conexión
              e intentalo de nuevo más tarde.
            </p>
          </div>
          <div
            v-if="wasAvatarUpdated && didAvatarUpdateFail === false"
            class="flex"
            style="gap: 0px"
          >
            <p
              class="columna-14 texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion p-2 borde-redondeado-8"
            >
              <span class="pictograma-aprobado" /> Actualización exitosa.
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
