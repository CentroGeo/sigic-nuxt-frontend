<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
const storeIA = useIAStore();
</script>
<template>
  <div v-if="!storeIA.existenProyectos">
    <div style="max-height: 85vh; overflow-y: auto" class="p-x-3 p-t-3">
      <button
        style="width: 100%; text-align: center; display: inline-block"
        class="boton-primario"
        aria-label="Crear nuevo chat"
        disabled
      >
        Nuevo chat
      </button>

      <!-- TODO: agregar estilo de campo de búsqueda deshabilitado -->
      <ClientOnly>
        <SisdaiCampoBusqueda
          style="width: 100%"
          class="m-y-3"
          etiqueta="Buscar chats"
        />
      </ClientOnly>

      <h6>Chats</h6>
      <div class="nota fondo-color-neutro p-2 borde-redondeado-8">
        <h6 class="m-t-0">Crea un contexto para iniciar un chat</h6>
        <p>
          Después de crear un proyecto, crea un contexto para iniciar un chat.
          Los nuevos chats aparecerán en esta sección.
        </p>
      </div>
    </div>
  </div>
</template>
