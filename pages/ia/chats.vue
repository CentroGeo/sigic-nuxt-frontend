<script setup>
const storeIA = useIAStore();
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLeyendaInicioListas />

      <IaListaChats
        v-if="storeIA.existenProyectos"
        texto-boton="Nuevo chat"
        titulo="Chats"
        etiqueta-busqueda="Buscar chats"
      />
    </template>

    <template #vistas-ia>
      <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />

      <div v-else>Da click en un chat para iniciar o crea un nuevo chat</div>
    </template>
  </IaLayoutPaneles>
</template>
