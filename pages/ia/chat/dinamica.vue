<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaChats texto-boton="Nuevo chat" titulo="Chats" etiqueta-busqueda="Buscar chats" />
    </template>

    <template #vistas-ia>
      <IaVistaChats :context-id="contextId" :chat-id="chatId" />
    </template>
  </IaLayoutPaneles>
</template>


<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const contextId = computed(() => route.query.context_id)
const chatId = computed(() => route.query.chat_id || "0")
</script>
