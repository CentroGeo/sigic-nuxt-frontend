<script setup>
useHead(() => ({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    },
  ],
}));
</script>

<template>
  <div class="layout-visualizar">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.layout-visualizar {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--fondo, #fff);
  margin: 0;
  padding: 0;
}
</style>

<style>
html,
body {
  margin: 0 !important;
  padding: 0 !important;
}
</style>
