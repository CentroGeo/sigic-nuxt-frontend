<script setup>
defineProps({
  grupos: {
    type: Array,
    required: true,
  },
  activo: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['seleccionar']);
</script>

<template>
  <nav
    v-if="grupos.length > 1"
    class="tablero-nav-grupos"
    role="tablist"
    aria-label="Grupos de indicadores"
  >
    <button
      v-for="grupo in grupos"
      :key="grupo.id"
      role="tab"
      :aria-selected="grupo.id === activo"
      class="tablero-nav-grupos__tab"
      :class="{ 'tablero-nav-grupos__tab--activo': grupo.id === activo }"
      @click="emit('seleccionar', grupo.id)"
    >
      {{ grupo.name }}
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.tablero-nav-grupos {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--tablero-border-color, #e0e0e0);
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;

  &__tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--tablero-interface-text, inherit);
    border-bottom: 3px solid transparent;
    transition:
      border-color 0.2s,
      color 0.2s;

    &:hover {
      border-bottom-color: var(--tablero-header-bg, #691c32);
      opacity: 0.8;
    }

    &--activo {
      font-weight: 600;
      border-bottom-color: var(--tablero-header-bg, #691c32);
      color: var(--tablero-header-bg, #691c32);
    }
  }
}
</style>
