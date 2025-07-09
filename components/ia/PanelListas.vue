<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
</script>
<template>
  <div class="panel-izquierdo">
    <div v-if="!storeIA.existenProyectos" class="p-3">
      <button
        class="boton-primario flex-contenido-centrado flex-vertical-centrado boton-nuevo-chat"
        type="button"
        :disabled="true"
      >
        Nuevo chat
      </button>

      <!-- TODO: agregar estilo de campo de búsqueda deshabilitado -->
      <SisdaiCampoBusqueda class="m-y-3" />

      <h6 class="m-b-1">Chats</h6>
      <div class="nota fondo-color-neutro p-2 borde-redondeado-8 m-t-0">
        <h6 class="m-t-0 m-b-2">Crea un contexto para iniciar un chat</h6>
        <p>
          Después de crear un proyecto, crea un contexto para iniciar un chat.
          Los nuevos chats aparecerán en esta sección.
        </p>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<style lang="scss">
.panel-izquierdo {
  // width: auto;
  min-width: 299px;
  height: 85vh;
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  box-shadow: 4px 0 4px -4px var(--navegacion-primaria-sombra);
}

.boton-nuevo-chat {
  width: 100%;
}
</style>
