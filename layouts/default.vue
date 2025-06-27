<script setup>
import MainNavegacion from "~/components/base/MainNavegacion.vue";
import SisdaiMenuAccesibilidad from "@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue";
import { useAccesibilidadStore } from "~/stores/accesibilidad";
const accesibilidadStore = useAccesibilidadStore();

const { status, signIn, signOut } = useAuth();

const loggedIn = computed(() => status.value === "authenticated");
async function handleSignIn() {
  await signIn("keycloak", {
    callbackUrl: "/", // A dónde volver después del login
    redirect: true,
  });
}
async function handleSignOut() {
  await signOut({ callbackUrl: "/" });
}
</script>

<template>
  <div>
    <MainNavegacion />

    <main id="principal">
      <slot />
    </main>

    <!-- parece que boton flotante agrega un id al elemento html que no 
    coincide al hacer server side rendering -->
    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" />
    </client-only>
  </div>
</template>
