<script setup>
const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  tag: {
    type: String,
    default: "Capas",
  },
  numberElements: {
    type: Number,
    default: 0,
  },
});
const { title, tag, numberElements } = toRefs(props);
</script>
<template>
  <div class="tarjeta">
    <button
      type="button"
      class="boton-sin-contenedor-secundario boton-mediano boton-pictograma"
      aria-label="Desplegar"
    >
      <div class="flex columna-16">
        <p class="tarjeta-titulo columna-8">{{ title }}</p>
        <span class="pictograma-angulo-abajo" aria-hidden="true"></span>
      </div>
      <UiNumeroElementos :numero="numberElements" :etiqueta="tag" />
    </button>
  </div>
</template>
