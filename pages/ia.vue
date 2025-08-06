<script setup>
definePageMeta({
  middleware: 'redireccionar-modulo-ia',
  bodyAttrs: {
    class: '',
  },
});
const ruta = '/ia';
onMounted(() => (document.querySelector('body').className = ''));
</script>
<template>
  <div class="modulo-ia flex">
    <UiNavegacionLateral
      :id-colapsable="`uinavegacionlateral-` + Math.random().toString(36).substring(2)"
      :sub-paginas="[
        {
          pictograma: 'pictograma-chat',
          ruta: `${ruta}/chats`,
        },
        {
          pictograma: 'pictograma-proyectos',
          ruta: `${ruta}/proyectos`,
        },
      ]"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.modulo-ia {
  gap: 0;
  height: 85vh;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
