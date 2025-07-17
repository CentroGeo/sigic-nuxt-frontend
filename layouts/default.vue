<script setup>
import MainNavegacion from "~/components/base/MainNavegacion.vue";
import SisdaiMenuAccesibilidad from "@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue";
import { useAccesibilidadStore } from "~/stores/accesibilidad";
const accesibilidadStore = useAccesibilidadStore();
</script>

<template>
  <div>
    <a href="#principal" class="ir-contenido-principal">
      Ir a contenido principal
    </a>
    <MainNavegacion />

    <main id="principal" class="p-t-7">
      <slot />
    </main>

    <!-- parece que boton flotante agrega un id al elemento html que no 
    coincide al hacer server side rendering -->
    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" />
    </client-only>
  </div>
</template>
<style lang="scss">
nav.navegacion.navegacion-pegada {
  top: 60px;
}
.navbar-brand {
  margin-right: 41rem;
}
</style>
