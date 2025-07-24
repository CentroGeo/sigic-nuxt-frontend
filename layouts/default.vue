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
      <SisdaiMenuAccesibilidad
        :objeto-store="accesibilidadStore"
        perfil-color="sigic"
      />
    </client-only>
  </div>
</template>
<style lang="scss">
nav.navegacion.navegacion-pegada {
  top: 54px;
}
:root {
  --escala-rem-gob-sisdai: 0.65;
}
nav.navbar {
  padding-top: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-bottom: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
}
nav.navbar.navbar-fixed-top {
  z-index: 9999;
}
a.navbar-brand {
  margin-right: calc(var(--escala-rem-gob-sisdai) * 63rem);
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 0 calc(var(--escala-rem-gob-sisdai) * 0.3125rem) 0 !important;
}
.navbar-expand-md .navbar-nav .nav-link {
  padding-right: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-left: calc(var(--escala-rem-gob-sisdai) * 1.5rem);
  padding-top: calc(var(--escala-rem-gob-sisdai) * 1.8rem);
}
@media (min-width: 768px) and (max-width: 992px) {
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 61rem);
  }
}
@media (min-width: 576px) and (max-width: 768px) {
  .navbar-dark .navbar-toggler {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 9rem);
  }
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 41rem);
  }
}
@media (max-width: 576px) {
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 41rem);
  }
}
.navbar-toggler-icon {
  display: inline-block;
  width: calc(var(--escala-rem-gob-sisdai) * 1.5em);
  height: calc(var(--escala-rem-gob-sisdai) * 1.5em);
}
// footer.main-footer {
//   width: 100%;
//   display: inline-flex;
// }
// footer.main-footer .list-info {
//   width: 100%;
// }
</style>
