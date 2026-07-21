<script setup>
defineProps({
  contenido: { type: String, required: true },
  marcador: { type: Object, default: null },
});

defineEmits({ alCerrar: [] });
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div v-if="!marcador" v-html="contenido" />

  <div v-else>
    <button class="boton-primario boton-chico" @click="$emit('alCerrar')">
      <span class="pictograma-cerrar m-r-1" aria-hidden="true" />
    </button>

    <div>
      <h2 class="m-b-1">{{ marcador.title }}</h2>
      <p class="m-t-0">
        <span class="pictograma-ubicacion pictograma-mediano p-0 m-r-1" aria-hidden="true" />
        <span> {{ marcador.lat }}, {{ marcador.lng }} </span>
      </p>

      <img v-if="marcador.image_url" :src="marcador.image_url" :alt="marcador.title" />

      <!-- eslint-disable vue/no-v-html -->
      <div v-html="marcador.content" />
    </div>
  </div>
</template>
