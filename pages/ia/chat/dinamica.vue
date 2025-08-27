<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaChats titulo="Chats" texto-boton="Nuevo chat" etiqueta-busqueda="Buscar chats" />
    </template>

    <template #vistas-ia>
      <main id="principal" class="m-b-10 p-t-3">
        <IaVistaChats :context-id="contextId" :chat-id="chatId" />
      </main>
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
