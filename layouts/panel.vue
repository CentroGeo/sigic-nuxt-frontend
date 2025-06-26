<script setup>
import SisdaiMenuAccesibilidad from "@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue";
import { useAccesibilidadStore } from "~/stores/accesibilidad";
const accesibilidadStore = useAccesibilidadStore();
</script>
<template>
  <div class="panel-ia grid">
    <div class="columna-1"></div>
    <div class="columna-15">
      <main>
        <NuxtPage />
      </main>
    </div>
    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" />
    </client-only>
  </div>
</template>

<style lang="scss">
.panel-ia {
  gap: 0;
}
</style>
