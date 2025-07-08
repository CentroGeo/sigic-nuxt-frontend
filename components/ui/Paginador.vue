<script setup>
const props = defineProps({
  totalPaginas: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["cambio"]);

const pagina = ref(0);

// Emitimos cada que cambia internamente
watch(pagina, (nuevaPagina) => {
  emit("cambio", nuevaPagina);
});

const irAPagina = (nueva) => {
  pagina.value = Math.min(Math.max(0, nueva), props.totalPaginas - 1);
};

const irAlInicio = () => irAPagina(0);
const irAnterior = () => irAPagina(pagina.value - 1);
const irSiguiente = () => irAPagina(pagina.value + 1);
const irAlFinal = () => irAPagina(props.totalPaginas - 1);

const cambiarPorInput = (e) => {
  const val = parseInt(e.target.value, 10) - 1;
  if (!isNaN(val)) {
    irAPagina(val);
  }
};
</script>
<template>
  <div class="paginador p-x-2 p-y-1 fondo-color-neutro">
    <button
      @click="irAlInicio"
      :disabled="pagina <= 0"
      class="boton-secundario boton-chico boton-pictograma"
    >
      <span class="pictograma-angulo-doble-arriba"></span>
    </button>
    <button
      @click="irAnterior"
      :disabled="pagina <= 0"
      class="boton-secundario boton-chico boton-pictograma m-x-1"
    >
      <span class="pictograma-angulo-arriba"></span>
    </button>
    <input
      type="number"
      :value="pagina + 1"
      @change="cambiarPorInput"
      min="1"
      :max="totalPaginas"
    />
    <span> / {{ totalPaginas }}</span>

    <button
      class="boton-secundario boton-chico boton-pictograma m-x-1"
      @click="irSiguiente"
      :disabled="pagina >= totalPaginas - 1"
    >
      <span class="pictograma-angulo-abajo"></span>
    </button>
    <button
      class="boton-secundario boton-chico boton-pictograma"
      @click="irAlFinal"
      :disabled="pagina >= totalPaginas - 1"
    >
      <span class="pictograma-angulo-doble-abajo"></span>
    </button>
  </div>
</template>
<style lang="scss">
.paginador {
  input {
    width: 80px;
    text-align: center;
  }
}
</style>
