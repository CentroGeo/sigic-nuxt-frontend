<script setup>
import SisdaiNavegacionPrincipal from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue';

const { status, signIn, signOut } = useAuth();
const route = useRoute();

async function iniciarSesion() {
  await signIn('keycloak', {
    // A dónde volver después del login
    callbackUrl: route.fullPath,
  });
}

async function cerrarSesion() {
  await signOut({ callbackUrl: route.fullPath });
}
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
        <button
          v-if="status === 'authenticated'"
          aria-label="Cerrar sesión"
          type="button"
          class="boton-secundario btn-inicio-sesion"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>

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
button.boton-secundario.btn-inicio-sesion {
  box-shadow: none;
  color: var(--navegacion-primaria-color);
  font-weight: 400;
  font-size: 0.875rem;

  border-radius: 0;
  &:hover {
    background-color: var(--navegacion-primaria-cursor-fondo);
  }
  &:active {
    box-shadow: inset 0 -4px 0 0 var(--navegacion-primaria-activo-borde);
  }
}
body[data-tema='oscuro'] {
  img.color-invertir {
    filter: grayscale(1) brightness(100);
  }
}
.contenedor-identidades-nav {
  display: inline-flex;
}
</style>
