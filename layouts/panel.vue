<script setup>
import SisdaiMenuAccesibilidad from "@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue";
import { useAccesibilidadStore } from "~/stores/accesibilidad";
import SisdaiMenuLateral from "@centrogeomx/sisdai-componentes/src/componentes/menu-lateral/SisdaiMenuLateral.vue";
const accesibilidadStore = useAccesibilidadStore();
</script>
<template>
  <div class="panel-ia grid">
    <div class="columna-4">
      <SisdaiMenuLateral>
        <template #contenido-menu-lateral>
          <ul>
            <li>
              <NuxtLink to="/ia/panel/proyectos">Proyectos</NuxtLink>
            </li>
          </ul>
        </template>
      </SisdaiMenuLateral>
    </div>

    <div class="columna-8">
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
.menu-lateral-contenedor {
  height: 100%;
}
</style>
