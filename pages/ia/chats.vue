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
      <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />
    </template>
  </IaLayoutPaneles>
</template>
