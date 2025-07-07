<script setup>
defineProps({
  totalPaginas: {
    type: Number,
    default: 1,
  },
});
</script>
<template>
  <div class="paginador">
    <button>i</button>
    <button>s</button>
    <input type="number" /> /pags
    <button>a</button>
    <button>f</button>
  </div>
</template>
