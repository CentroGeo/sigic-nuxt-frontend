<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const GRUPOS = {
  Mapa: [
    'fas fa-map',
    'fas fa-map-marker-alt',
    'fas fa-globe',
    'fas fa-globe-americas',
    'fas fa-layer-group',
    'fas fa-compass',
    'fas fa-location-arrow',
    'fas fa-map-marked-alt',
  ],
  Gráfica: [
    'fas fa-chart-bar',
    'fas fa-chart-line',
    'fas fa-chart-pie',
    'fas fa-chart-area',
    'fas fa-poll',
    'fas fa-poll-h',
    'fas fa-signal',
    'fas fa-percentage',
  ],
  Datos: [
    'fas fa-database',
    'fas fa-table',
    'fas fa-file-alt',
    'fas fa-file-csv',
    'fas fa-list',
    'fas fa-list-ol',
    'fas fa-filter',
    'fas fa-search',
  ],
  Personas: [
    'fas fa-users',
    'fas fa-user',
    'fas fa-home',
    'fas fa-building',
    'fas fa-city',
    'fas fa-school',
    'fas fa-hospital',
    'fas fa-child',
  ],
  Naturaleza: [
    'fas fa-leaf',
    'fas fa-tree',
    'fas fa-water',
    'fas fa-mountain',
    'fas fa-sun',
    'fas fa-cloud',
    'fas fa-wind',
    'fas fa-fire',
  ],
  Infraestructura: [
    'fas fa-road',
    'fas fa-car',
    'fas fa-train',
    'fas fa-plane',
    'fas fa-ship',
    'fas fa-truck',
    'fas fa-plug',
    'fas fa-wifi',
  ],
  Economía: [
    'fas fa-dollar-sign',
    'fas fa-money-bill-wave',
    'fas fa-industry',
    'fas fa-store',
    'fas fa-briefcase',
    'fas fa-landmark',
    'fas fa-coins',
    'fas fa-shopping-cart',
  ],
  Ciencia: [
    'fas fa-flask',
    'fas fa-microscope',
    'fas fa-atom',
    'fas fa-dna',
    'fas fa-satellite',
    'fas fa-broadcast-tower',
    'fas fa-vial',
    'fas fa-brain',
  ],
};

const todos = Object.values(GRUPOS).flat();

const busqueda = ref('');
const abierto = ref(false);

const iconsVisibles = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return GRUPOS;
  const filtrados = todos.filter((ic) => ic.includes(q));
  return filtrados.length ? { Resultados: filtrados } : {};
});

function seleccionar(ic) {
  emit('update:modelValue', ic === props.modelValue ? '' : ic);
  abierto.value = false;
  busqueda.value = '';
}

function limpiar() {
  emit('update:modelValue', '');
}
</script>

<template>
  <div class="picker-icono">
    <div class="picker-icono__actual" @click="abierto = !abierto">
      <span v-if="modelValue" :class="modelValue" class="picker-icono__preview" />
      <span v-else class="picker-icono__vacio">Sin ícono</span>
      <span class="picker-icono__flecha">{{ abierto ? '▲' : '▼' }}</span>
    </div>

    <div v-if="abierto" class="picker-icono__panel">
      <div class="picker-icono__busqueda">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar ícono..."
          class="campo-texto campo-texto-chico"
          autofocus
        />
        <button
          v-if="modelValue"
          type="button"
          class="boton boton-chico boton-secundario"
          @click="limpiar"
        >
          Quitar
        </button>
      </div>

      <div v-if="!Object.keys(iconsVisibles).length" class="picker-icono__vacio-msg">
        Sin coincidencias
      </div>

      <div v-for="(iconos, grupo) in iconsVisibles" :key="grupo" class="picker-icono__grupo">
        <p class="picker-icono__grupo-titulo">{{ grupo }}</p>
        <div class="picker-icono__grid">
          <button
            v-for="ic in iconos"
            :key="ic"
            type="button"
            class="picker-icono__btn"
            :class="{ activo: ic === modelValue }"
            :title="ic"
            @click="seleccionar(ic)"
          >
            <span :class="ic" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.picker-icono {
  position: relative;

  &__actual {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border: 1px solid var(--color-borde, #ccc);
    border-radius: 4px;
    padding: 4px 10px;
    background: #fff;
    min-width: 120px;
    user-select: none;
  }

  &__preview {
    font-size: 1.1rem;
  }

  &__vacio {
    color: var(--color-texto-secundario, #888);
    font-size: 0.85rem;
  }

  &__flecha {
    margin-left: auto;
    font-size: 0.7rem;
    color: var(--color-texto-secundario, #888);
  }

  &__panel {
    position: absolute;
    z-index: 200;
    top: calc(100% + 4px);
    left: 0;
    width: 320px;
    max-height: 360px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid var(--color-borde, #ccc);
    border-radius: 6px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &__busqueda {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;

    input {
      flex: 1;
    }
  }

  &__vacio-msg {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #888);
    text-align: center;
    padding: 1rem;
  }

  &__grupo {
    margin-bottom: 10px;
  }

  &__grupo-titulo {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-texto-secundario, #888);
    letter-spacing: 0.05em;
    margin: 0 0 4px;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 4px;
    background: var(--color-fondo-2, #f5f5f5);
    cursor: pointer;
    font-size: 1rem;
    transition:
      background 0.1s,
      border-color 0.1s;

    &:hover {
      background: var(--color-primario-suave, #f0e4e8);
      border-color: var(--color-primario, #691c32);
    }

    &.activo {
      background: var(--color-primario, #691c32);
      color: #fff;
      border-color: var(--color-primario, #691c32);
    }
  }
}
</style>
