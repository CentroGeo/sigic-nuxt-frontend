<script setup>
definePageMeta({
  middleware: 'auth',
});
const config = useRuntimeConfig();
const { data } = useAuth();

const idps = ref([]);
const isLoading = ref(null);
const fetchingStatus = ref(null);
const deteleStatus = ref(null);

async function buildIDPsInfo() {
  isLoading.value = true;
  fetchingStatus.value = null;

  const urlConnected = `${config.public.keycloakIssuer}/account/linked-accounts?first=0&linked=true`;
  const urlNotConnected = `${config.public.keycloakIssuer}/account/linked-accounts?first=0&linked=false`;
  const token = ref(data.value?.accessToken);
  try {
    // Obtenemos los conectados
    const requestConnected = await fetch(urlConnected, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    //Obtenemos los no conectados
    const requestNotConnected = await fetch(urlNotConnected, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${data.value?.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!requestConnected.ok || !requestNotConnected.ok) {
      fetchingStatus.value = 'fail';
    } else {
      const resConnected = await requestConnected.json();
      const resNotConnected = await requestNotConnected.json();
      // Juntamos los servicios y los ordenamos alfabéticamente
      idps.value = [...resNotConnected, ...resConnected];
      idps.value = idps.value.sort((a, b) => a.displayName.localeCompare(b.displayName));
      fetchingStatus.value = 'ok';
    }
  } catch {
    fetchingStatus.value = 'fail';
  }

  isLoading.value = false;
}

function updatePassword() {
  const url = `${config.public.keycloakIssuer}/protocol/openid-connect/auth?client_id=${config.public.keycloakClientId}&redirect_uri=${encodeURIComponent('https://sigic.dev.geoint.mx/')}&response_type=code&scope=openid&kc_action=UPDATE_PASSWORD`;
  navigateTo(url, { external: true });
}

function linkSocialAccount(idp) {
  const url = `${config.public.keycloakIssuer}/protocol/openid-connect/auth?client_id=${config.public.keycloakClientId}&redirect_uri=${encodeURIComponent('https://sigic.dev.geoint.mx/')}&response_type=code&scope=openid&kc_action=idp_link:${idp}`;
  navigateTo(url, { external: true });
}

async function unlinkSocialAccount(idp) {
  // Eliminamos el recurso
  deteleStatus.value = null;
  const url = `${config.public.keycloakIssuer}/account/linked-accounts/${idp}/`;
  const token = ref(data.value?.accessToken);
  const deleteIDP = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token.value}`,
      'Content-Type': 'application/json',
    },
  });
  if (!deleteIDP.status) {
    deteleStatus.value = 'fail';
  } else {
    deteleStatus.value = 'ok';
    // Reconstruimos el diccionario de información
    buildIDPsInfo();
  }
}
onMounted(() => {
  buildIDPsInfo();
});
</script>
<template>
  <div>
    <h2>Seguridad</h2>
    <div class="p-x-7 p-b-5">
      <h3>Cambiar contraseña</h3>
      <p class="m-0">
        Elige una nueva contraseña para tu cuenta. Usa al menos 8 caracteres, incluyendo una letra
        mayúscula, una letra minúscula, un número y un símbolo.
      </p>
      <p>Es posible que se cierre tu sesión en otros dispositivos.</p>

      <button class="boton-primario boton-chico m-b-3" @click="updatePassword">
        Cambiar Contraseña
      </button>

      <h4>Vincular cuentas</h4>
      <p>
        Puedes conectar tus cuentas para facilitar el inicio de sesión y mantener sincronizada tu
        información profesional.
      </p>

      <!-- Spinner-->
      <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
        <img
          class="color-invertir"
          :src="`${config.app.baseURL}img/loader.gif`"
          alt="...Cargando"
          height="120px"
        />
      </div>

      <!-- Fracasaron las peticiones -->
      <div v-else-if="!isLoading && fetchingStatus === 'fail'">
        <div
          class="fondo-color-error flex flex-contenido-centrado ancho-lectura borde-redondeado-16 sin-seleccion"
        >
          <p class="texto-color-error m-1">
            No se pudo recuperar la información. Revisa tu conexión a internet e intentalo de nuevo
            más tarde.
          </p>
        </div>
      </div>

      <!-- Las tarjetas de cuentas vinculadas -->
      <div v-else-if="!isLoading && fetchingStatus === 'ok'">
        <!--Alerta de que fracasó la desvinculación de servicios-->
        <div
          v-if="deteleStatus === 'fail'"
          class="flex m-y-2 borde-redondeado-16 flex-contenido-centrado fondo-color-error texto-color-error p-1"
          style="gap: 0px"
        >
          <div class="columna-3 flex-vertical-centrado m-x-0">
            <span class="pictograma-alerta pictograma-grande"></span>
          </div>
          <p class="columna-13">
            No se pudo completar la acción. Verifica tu conexión a internet e inténtalo de nuevo.
          </p>
        </div>
        <!-- Tarjetas de servicios -->
        <div v-for="broker in idps" :key="broker.providerAlias" class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <div class="flex flex-contenido-separado">
              <div class="flex-vertical-centrado">{{ broker.displayName }}</div>
              <div class="flex">
                <span
                  v-if="broker.connected === true"
                  class="flex flex-vertical-centrado texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-4 p-x-1"
                  >Vinculada</span
                >
                <span
                  v-if="broker.connected === false"
                  class="flex flex-vertical-centrado texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-x-1"
                  >No vinculada</span
                >
                <button
                  v-if="broker.connected === true"
                  class="boton-chico boton-secundario"
                  @click="unlinkSocialAccount(broker.providerName)"
                >
                  Desvincular
                </button>
                <button
                  v-if="broker.connected === false"
                  class="boton-chico boton-primario"
                  @click="linkSocialAccount(broker.providerName)"
                >
                  Vincular
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Cuadro de información -->
        <div class="tarjeta m-y-3 fondo-color-informacion texto-color-informacion">
          <div class="tarjeta-cuerpo">
            <p class="nota-titulo texto-color-informacion">
              <span class="pictograma-informacion" /> Información sobre las cuentas vinculadas
            </p>

            <p class="nota texto-color-informacion">
              Si desvinculas alguna cuenta, podrás seguir accediendo con tu usuario y contraseña del
              SIGIC, sin embargo, dejarás de poder iniciar sesión con esa plataforma vinculada.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
