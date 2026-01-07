<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

definePageMeta({
  middleware: 'auth',
});

const config = useRuntimeConfig();
const { gnoxyFetch } = useGnoxyUrl();
const isLoading = ref(true);
const status = ref('read');
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
  userInfo.value['first_name'] = info.first_name || '-';
  userInfo.value['last_name'] = info.last_name || '-';
  userInfo.value['email'] = info.email || '-';
  userInfo.value['organization'] = info.organization || '-';
  userInfo.value['department'] = info.department || '-';
  userInfo.value['position'] = info.position || '-';
  userInfo.value['city'] = info.city || '-';
  userInfo.value['state'] = info.state || '-';
  userInfo.value['postal_code'] = info.postal_code || '-';
  userInfo.value['country'] = info.country || '-';
  isLoading.value = false;
}

function updateInfo() {
  console.warn(userInfo.value);
}

onMounted(async () => {
  fetchData();
});
</script>
<template>
  <div>
    <h2>Información personal</h2>
    <div v-if="isLoading">...Cargando</div>
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
            v-for="(campo, index) in Object.keys(userInfo)"
            :key="index"
            v-model="userInfo[campo]"
            :etiqueta="tagsDict[campo]"
            :ejemplo="userInfo[campo]"
            tipo="text"
            class="m-b-2"
          />
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
  </div>
</template>
<style lang="scss" scoped>
img {
  border-radius: 50%;
  object-fit: contain;
}
</style>
