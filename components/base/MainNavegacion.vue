<script setup>
import SisdaiNavegacionPrincipal from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue';

const { status, signIn } = useAuth();
const route = useRoute();
const config = useRuntimeConfig();

async function iniciarSesion() {
  await signIn('keycloak', {
    // A dónde volver después del login
    callbackUrl: route.fullPath,
  });
}

const mostrarInicio = computed(() => !config.public.defaultPage);
const mostrarCatalogo = computed(() => config.public.enableCatalogoVista);
const mostrarConsulta = computed(() => config.public.enableConsulta);
const mostrarIaa = computed(() => config.public.enableIaa);
const mostrarAuth = computed(() => config.public.enableAuth);
</script>

<template>
  <SisdaiNavegacionPrincipal>
    <!--Definiendo el logo del sitio-->
    <template #identidad>
      <div class="contenedor-identidades-nav">
        <a
          href="https://secihti.mx/"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-hiperviculo-logo"
        >
          <img
            :src="`/img/logo_secihiti.svg`"
            class="nav-logo color-invertir"
            alt="SECIHITI"
            height="36"
          />
        </a>
        <NuxtLink to="/" rel="noopener noreferrer" class="nav-hiperviculo-logo">
          <img
            :src="`/img/logo_sigic.svg`"
            class="nav-logo color-invertir"
            alt="SIGIC"
            height="36"
          />
        </NuxtLink>
      </div>
    </template>

    <ul class="nav-menu">
      <li v-if="mostrarInicio">
        <NuxtLink class="nav-hipervinculo" to="/" exact-path>Inicio</NuxtLink>
      </li>
      <!-- <li><NuxtLink class="nav-hipervinculo" to="/carga">Carga</NuxtLink></li> -->
      <li v-if="mostrarCatalogo">
        <NuxtLink class="nav-hipervinculo" to="/catalogo">Catálogo</NuxtLink>
      </li>
      <li v-if="mostrarConsulta">
        <NuxtLink class="nav-hipervinculo" to="/consulta">Consulta</NuxtLink>
      </li>
      <li v-if="mostrarIaa">
        <NuxtLink class="nav-hipervinculo" to="/ia">Análisis Inteligencia Artificial</NuxtLink>
      </li>
      <li v-if="mostrarAuth">
        <NuxtLink v-if="status === 'authenticated'" class="nav-hipervinculo" to="/mi-cuenta"
          >Mi cuenta</NuxtLink
        >

        <button
          v-else
          aria-label="Iniciar sesión"
          type="button"
          class="boton-secundario btn-inicio-sesion"
          @click="iniciarSesion"
        >
          Iniciar sesión
        </button>
      </li>
    </ul>
  </SisdaiNavegacionPrincipal>
</template>

<style lang="scss">
body[data-tema='oscuro'] {
  img.color-invertir {
    filter: grayscale(1) brightness(100);
  }
}
.contenedor-identidades-nav {
  display: inline-flex;
}
</style>
