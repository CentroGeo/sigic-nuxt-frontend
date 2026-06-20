<script setup>
import { ref } from 'vue';

// const props = defineProps({
//   modelValue: {
//     type: String,
//     default: 'osm',
//   },
// });

const emit = defineEmits(['update:modelValue']);

const abierto = ref(false);

const opciones = [
  { valor: 'osm', etiqueta: 'OpenStreetMap' },
  { valor: 'carto', etiqueta: 'Carto Light' },
  { valor: 'carto_dark', etiqueta: 'Carto Dark' },
  { valor: 'satellite', etiqueta: 'Satélite' },
];

function elegir(valor) {
  emit('update:modelValue', valor);
  abierto.value = false;
}

function alternar() {
  abierto.value = !abierto.value;
}
</script>

<template>
  <div class="capa-base-control">
    <div v-if="abierto" class="capa-base-panel">
      <strong class="capa-base-titulo">Capa base</strong>
      <ul class="capa-base-lista">
        <li v-for="op in opciones" :key="op.valor">
          <button
            type="button"
            class="capa-base-opcion"
            :class="{ activa: op.valor === modelValue }"
            @click="elegir(op.valor)"
          >
            {{ op.etiqueta }}
          </button>
        </li>
      </ul>
    </div>

    <button
      class="capa-base-boton sisdai-mapa-control-boton"
      type="button"
      :aria-pressed="abierto"
      aria-label="Cambiar capa base"
      title="Capa base"
      @click="alternar"
    >
      <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.capa-base-control {
  position: absolute;
  bottom: 40px;
  right: 8px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.capa-base-boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: var(--boton-mapa-fondo, #ff51ba);
  color: var(--boton-mapa-texto, #fff);

  &:hover,
  &:focus-visible {
    background-color: var(--boton-mapa-fondo-hover, #ff51ba);
    filter: brightness(0.92);
  }
}

.capa-base-panel {
  width: 180px;
  background-color: rgba(255, 255, 255, 0.96);
  color: #222;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  padding: 8px 10px;
}

.capa-base-titulo {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.capa-base-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capa-base-opcion {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #222;

  &:hover,
  &:focus-visible {
    background-color: #f0f0f0;
  }

  &.activa {
    border-color: var(--boton-mapa-fondo, #ff51ba);
    font-weight: 600;
  }
}
</style>
