<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
const storeIA = useIAStore();
</script>
<template>
  <div v-if="!storeIA.existenProyectos">
    <div class="fondo-color-acento p-x-3 p-y-1">
      <h5>Chats</h5>
    </div>
    <div class="p-x-3 p-t-3">
      <button class="boton-listas boton boton-primario" aria-label="Crear nuevo chat" disabled>
        Nuevo chat
      </button>

      <!-- TODO: agregar prop y estilo de deshabilitado a SisdaiCampoBusqueda  -->
      <ClientOnly>
        <SisdaiCampoBusqueda style="width: 100%" class="m-y-3" etiqueta="Buscar chats" />
      </ClientOnly>

      <div class="nota fondo-color-neutro p-2 borde-redondeado-8">
        <h6 class="m-t-0">Crea un contexto para iniciar un chat</h6>
        <p class="m-b-0">
          Después de crear un proyecto, crea un contexto para iniciar un chat. Los nuevos chats
          aparecerán en esta sección.
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.boton-listas {
  width: 100%;
  text-align: center;
  display: inline-block;
}
</style>
