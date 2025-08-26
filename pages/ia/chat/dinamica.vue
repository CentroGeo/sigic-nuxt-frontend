<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaChats titulo="Chats" texto-boton="Nuevo chat" etiqueta-busqueda="Buscar chats" />
    </template>

    <template #vistas-ia>
      <IaVistaChats :context-id="contextId" :chat-id="chatId" />
    </template>
  </IaLayoutPaneles>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const contextId = computed(() => route.query.context_id);
const chatId = computed(() => route.query.chat_id || '0');
</script>
