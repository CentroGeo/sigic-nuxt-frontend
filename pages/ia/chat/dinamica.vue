<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaChats
        texto-boton="Nuevo chat"
        titulo="Chats"
        etiqueta-busqueda="Buscar chats"
      />
    </template>

    <template #vistas-ia>
      <IaVistaChats :context-id="contextId" />
    </template>
  </IaLayoutPaneles>
</template>


<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const contextId = computed(() => route.query.context_id)
</script>
