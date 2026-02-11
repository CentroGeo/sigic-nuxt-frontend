<script setup>
definePageMeta({
  middleware: 'redireccionar-modulo-ia',
});
</script>
<template>
  <div class="modulo-ia flex">
    <UiNavegacionLateral
      :id-colapsable="`uinavegacionlateral-` + Math.random().toString(36).substring(2)"
      :sub-paginas="[
        // {
        //   pictograma: 'pictograma-chat',
        //   ruta: 'ia/chats',
        //   globo: 'Chats',
        // },
        {
          pictograma: 'pictograma-proyectos',
          ruta: 'ia/proyectos',
          globo: 'Proyectos',
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
  --altura-consulta-esc: calc(100vh - 112px);
  height: var(--altura-consulta-esc);
  gap: 0;
  .contenedor-contenido {
    flex: 1;
    .columna-4,
    .columna-8,
    .columna-12,
    .columna-16 {
      height: var(--altura-consulta-esc);
    }
  }
}
</style>
