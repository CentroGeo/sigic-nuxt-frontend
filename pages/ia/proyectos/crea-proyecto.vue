<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";

import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
</script>
<template>
  <LayoutIA>
    <div class="grid">
      <div class="columna-4">
        <PanelListas>
          <h6 class="m-t-0">Proyectos</h6>
        </PanelListas>
      </div>

      <div class="columna-12">
        <!-- Vista CreaProyecto -->
        <div class="contenedor">
          <h2>Configuración del Proyecto</h2>
          <NuxtLink
            class="boton boton-primario"
            aria-label="Crear proyecto"
            to="/ia/proyectos"
            @click="storeIA.crearProyecto()"
          >
            Crear proyecto
          </NuxtLink>
        </div>
      </div>
    </div>
  </LayoutIA>
</template>
