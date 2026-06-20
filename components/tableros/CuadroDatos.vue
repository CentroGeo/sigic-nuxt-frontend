<script setup>
const props = defineProps({
  cuadro: {
    type: Object,
    required: true,
  },
  valor: {
    type: [String, Number],
    default: null,
  },
});

const clasesTamano = computed(() => {
  const mapa = {
    1: 'cuadro-datos--sm',
    2: 'cuadro-datos--md',
    3: 'cuadro-datos--lg',
  };
  return mapa[props.cuadro.size || '1'] || 'cuadro-datos--sm';
});

const estiloBorde = computed(() => {
  const { edge_style, edge_color } = props.cuadro;
  if (!edge_style || edge_style === '8') return {};

  const color = edge_color || '#000000';
  const borde = `3px solid ${color}`;

  const estilos = {
    1: { borderLeft: borde },
    2: { borderRight: borde },
    3: { borderTop: borde },
    4: { borderBottom: borde },
    5: { borderTop: borde, borderBottom: borde },
    6: { borderLeft: borde, borderRight: borde },
    7: { border: borde },
  };
  return estilos[edge_style] || {};
});

const valorFormateado = computed(() => {
  if (props.valor === null || props.valor === undefined) return '—';
  if (typeof props.valor === 'number') {
    return props.valor.toLocaleString('es-MX');
  }
  return props.valor;
});
</script>

<template>
  <div
    class="cuadro-datos"
    :class="clasesTamano"
    :style="{
      backgroundColor: cuadro.color || '#000000',
      color: cuadro.text_color || '#ffffff',
      ...estiloBorde,
    }"
  >
    <div class="cuadro-datos__contenido">
      <p class="cuadro-datos__nombre">{{ cuadro.name }}</p>
      <p class="cuadro-datos__valor">
        {{ valorFormateado }}
        <span v-if="cuadro.is_percentage" class="cuadro-datos__porcentaje">%</span>
      </p>
    </div>

    <div class="cuadro-datos__icono">
      <img
        v-if="cuadro.icon_custom"
        :src="cuadro.icon_custom"
        :alt="cuadro.name"
        class="cuadro-datos__icono-img"
      />
      <span v-else-if="cuadro.icon" :class="cuadro.icon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cuadro-datos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  gap: 1rem;

  &--sm {
    min-height: 80px;
  }

  &--md {
    min-height: 100px;
    grid-column: span 1;
  }

  &--lg {
    min-height: 120px;
    grid-column: span 2;
  }

  &__nombre {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    opacity: 0.85;
    letter-spacing: 0.03em;
  }

  &__valor {
    margin: 0.25rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  &__porcentaje {
    font-size: 0.75em;
  }

  &__icono {
    flex-shrink: 0;
    font-size: 1.5rem;
    opacity: 0.7;
  }

  &__icono-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}
</style>
