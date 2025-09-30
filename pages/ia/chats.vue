<script setup>
const storeIA = useIAStore();
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <IaLeyendaInicioListas />

      <IaListaChats
        v-if="storeIA.existenProyectos"
        titulo="Chats"
        texto-boton="Nuevo chat"
        etiqueta-busqueda="Buscar chats"
      />
    </template>

    <template #visualizador>
      <main
        id="principal"
        class="contenedor m-b-10 p-t-3"
        :style="storeIA.existenProyectos ? 'height: 85vh;' : ''"
      >
        <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />
        <p v-else>Selecciona un chat</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
