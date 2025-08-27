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
          globo: 'Chats',
        },
        {
          pictograma: 'pictograma-proyectos',
          ruta: `${ruta}/proyectos`,
          globo: 'Proyectos',
        },
      ]"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>
<style lang="scss">
.modulo-ia {
  gap: 0;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
