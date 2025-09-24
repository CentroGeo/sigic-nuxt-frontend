<script setup>
// import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
const storeIA = useIAStore();
const campoBusqueda = ref('');
</script>
<template>
  <div v-if="!storeIA.existenProyectos">
    <div class="fondo-color-acento p-x-3 p-y-1">
      <h5>Chats</h5>
    </div>
    <div class="p-x-3 p-t-3">
      <button
        class="boton-listas boton boton-primario m-b-3"
        aria-label="Crear nuevo chat"
        disabled
      >
        Nuevo chat
      </button>

      <ClientOnly>
        <!-- <SisdaiCampoBusqueda class="m-y-3" etiqueta="Buscar chats" /> -->
        <form class="campo-busqueda" @submit.prevent>
          <input
            id="idcampobusquedaia"
            v-model="campoBusqueda"
            type="search"
            class="campo-busqueda-entrada"
            placeholder="Buscar chats"
            disabled
          />
          <button
            class="boton-primario boton-pictograma campo-busqueda-buscar"
            aria-label="Buscar"
            type="button"
            disabled
          >
            <span class="pictograma-buscar" aria-hidden="true" />
          </button>
        </form>
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
