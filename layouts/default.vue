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
:root {
  --escala-rem-gob-sisdai: 0.6428571429;
}
nav.navbar {
  padding-top: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-bottom: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
}
a.navbar-brand {
  margin-right: calc(var(--escala-rem-gob-sisdai) * 63rem);
  margin-top: calc(var(--escala-rem-gob-sisdai) * 0.3125rem);
  margin-bottom: calc(var(--escala-rem-gob-sisdai) * 0.3125rem);
}
.navbar-expand-md .navbar-nav .nav-link {
  padding-right: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-left: calc(var(--escala-rem-gob-sisdai) * 1.5rem);
  padding-top: calc(var(--escala-rem-gob-sisdai) * 1.8rem);
}
@media (min-width: 576px) and (max-width: 775px) {
  .navbar-dark .navbar-toggler {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 9rem);
  }
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 41rem);
  }
}
.navbar-toggler-icon {
  display: inline-block;
  width: calc(var(--escala-rem-gob-sisdai) * 1.5em);
  height: calc(var(--escala-rem-gob-sisdai) * 1.5em);
}
</style>
