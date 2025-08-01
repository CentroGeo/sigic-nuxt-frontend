<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaChats texto-boton="Nuevo chat" titulo="Chats" etiqueta-busqueda="Buscar chats" />
    </template>

    <template #vistas-ia>
      <IaVistaChats />
    </template>
  </IaLayoutPaneles>
</template>
