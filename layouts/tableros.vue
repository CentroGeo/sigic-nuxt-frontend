<script setup>
import SisdaiMenuAccesibilidad from '@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue';
import SisdaiNavegacionGobMx from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-gob-mx/SisdaiNavegacionGobMx.vue';
import SisdaiPiePaginaGobMx from '@centrogeomx/sisdai-componentes/src/componentes/pie-pagina-gob-mx/SisdaiPiePaginaGobMx.vue';
import { useAccesibilidadStore } from '~/stores/accesibilidad';

const accesibilidadStore = useAccesibilidadStore();
</script>

<template>
  <div>
    <a href="#principal" class="ir-contenido-principal">Ir a contenido principal</a>
    <SisdaiNavegacionGobMx />

    <div class="contenido vista-tableros">
      <slot />
    </div>

    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" perfil-color="sigic" />
    </client-only>
    <SisdaiPiePaginaGobMx />
  </div>
</template>

<style lang="scss" scoped>
.vista-tableros {
  min-height: calc(100vh - 51px);
}
</style>
