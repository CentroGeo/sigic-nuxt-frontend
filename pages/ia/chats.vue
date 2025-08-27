<script setup>
const storeIA = useIAStore();
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLeyendaInicioListas />

      <IaListaChats
        v-if="storeIA.existenProyectos"
        titulo="Chats"
        texto-boton="Nuevo chat"
        etiqueta-busqueda="Buscar chats"
      />
    </template>

    <template #vistas-ia>
      <main
        id="principal"
        class="contenedor m-b-10 p-t-3"
        :style="storeIA.existenProyectos ? 'height: 85vh;' : ''"
      >
        <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />
      </main>
    </template>
  </IaLayoutPaneles>
</template>
