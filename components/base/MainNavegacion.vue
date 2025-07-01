<script setup>
import SisdaiNavegacionPrincipal from "@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue";

const { status, signIn, signOut } = useAuth();

const loggedIn = computed(() => status.value === "authenticated");
async function handleSignIn() {
  await signIn("keycloak", {
    callbackUrl: "/", // A dónde volver después del login
  });
}
async function handleSignOut() {
  await signOut({ callbackUrl: "/" });
}
</script>
<template>
  <SisdaiNavegacionPrincipal>
    <!--Definiendo el logo del sitio-->
    <template #identidad>
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-hiperviculo-logo"
      >
        <img
          src="https://www.centrogeo.org.mx/templates/ja_resume/images/logo_centrogeo_wide.svg"
          class="nav-logo color-invertir"
          alt="logo"
          width="232"
          height="38"
        />
      </a>
    </template>
    <ul class="nav-menu">
      <li>
        <NuxtLink class="nav-hipervinculo" to="/" exact-path>Inicio</NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/carga">Carga</NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/consulta/">Consulta</NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/consultas/capas">
          Consultas
        </NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-hipervinculo" to="/ia">IA</NuxtLink>
      </li>
      <li>
        <button v-if="loggedIn" @click="handleSignOut">Cerrar sesión</button>
        <button v-else @click="handleSignIn">Iniciar sesión</button>
      </li>
    </ul>
  </SisdaiNavegacionPrincipal>
</template>
