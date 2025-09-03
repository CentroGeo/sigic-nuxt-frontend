<script setup>
import SisdaiNavegacionPrincipal from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue';

const { status, signIn, signOut } = useAuth();

const estaLogueado = computed(() => status.value === 'authenticated');

async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: '/', // A dónde volver después del login
  });
}
async function cerrarSesion() {
  await signOut({ callbackUrl: '/' });
}
</script>
<template>
  <SisdaiNavegacionPrincipal>
    <!--Definiendo el logo del sitio-->
    <template #identidad>
      <a href="#" target="_blank" rel="noopener noreferrer" class="nav-hiperviculo-logo">
        <!-- <img
          src="https://www.centrogeo.org.mx/templates/ja_resume/images/logo_centrogeo_wide.svg"
          class="nav-logo color-invertir"
          alt="logo"
          width="232"
          height="38"
        /> -->
      </a>
    </template>
    <ul class="nav-menu">
      <li>
        <NuxtLink class="nav-hipervinculo" to="/" exact-path>Inicio</NuxtLink>
      </li>
      <!-- <li><NuxtLink class="nav-hipervinculo" to="/carga">Carga</NuxtLink></li> -->
      <li>
        <NuxtLink class="nav-hipervinculo" to="/catalogo">Catálogo</NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/consulta">Consulta</NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/ia"> Análisis Inteligencia Artificial </NuxtLink>
      </li>
      <li>
        <button v-if="estaLogueado" aria-label="Cerrar sesión" type="button" @click="cerrarSesion">
          Cerrar sesión
        </button>
        <button v-else aria-label="Iniciar sesión" type="button" @click="iniciarSesion">
          Iniciar sesión
        </button>
      </li>
    </ul>
  </SisdaiNavegacionPrincipal>
</template>
