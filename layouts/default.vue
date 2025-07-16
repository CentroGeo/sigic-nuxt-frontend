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

    <main id="principal">
      <slot />
    </main>

    <!-- parece que boton flotante agrega un id al elemento html que no 
    coincide al hacer server side rendering -->
    <client-only>
      <SisdaiMenuAccesibilidad
        :objeto-store="accesibilidadStore"
        perfil-color="sigic"
      />
    </client-only>
  </div>
</template>
