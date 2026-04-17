<script setup>
defineProps({
  subgrupos: {
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
  <nav v-if="subgrupos.length" class="tablero-nav-subgrupos" aria-label="Subgrupos de indicadores">
    <button
      v-for="subgrupo in subgrupos"
      :key="subgrupo.subgroup_id"
      class="tablero-nav-subgrupos__item"
      :class="{ 'tablero-nav-subgrupos__item--activo': subgrupo.subgroup_id === activo }"
      @click="emit('seleccionar', subgrupo.subgroup_id)"
    >
      <img
        v-if="subgrupo.icon_custom"
        :src="subgrupo.icon_custom"
        :alt="subgrupo.subgroup_name"
        class="tablero-nav-subgrupos__icono-img"
      />
      <span
        v-else-if="subgrupo.subgroup_icon"
        :class="subgrupo.subgroup_icon"
        class="tablero-nav-subgrupos__icono"
      />
      <span class="tablero-nav-subgrupos__nombre">{{ subgrupo.subgroup_name }}</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.tablero-nav-subgrupos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--tablero-border-color, #e0e0e0);
    border-radius: 2rem;
    background: var(--tablero-interface-bg, #ffffff);
    color: var(--tablero-interface-text, inherit);
    cursor: pointer;
    font-size: 0.875rem;
    transition:
      background-color 0.2s,
      border-color 0.2s;

    &:hover {
      border-color: var(--tablero-header-bg, #691c32);
    }

    &--activo {
      background-color: var(--tablero-header-bg, #691c32);
      color: var(--tablero-header-text, #ffffff);
      border-color: var(--tablero-header-bg, #691c32);
    }
  }

  &__icono-img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  &__icono {
    font-size: 1rem;
  }
}
</style>
