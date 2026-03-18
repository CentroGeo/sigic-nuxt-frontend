<script setup>
const { escenario, escena } = useRoute().params;
</script>

<template>
  <div>Editar: {{ escenario }} - {{ escena }}</div>
</template>
