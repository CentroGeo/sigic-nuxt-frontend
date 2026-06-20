<script setup>
const props = defineProps({
  cuadros: {
    type: Array,
    default: () => [],
  },
  datosIndicador: {
    type: Object,
    default: () => ({}),
  },
});

const cuadrosOrdenados = computed(() => [...props.cuadros].sort((a, b) => a.order - b.order));

function obtenerValor(cuadro) {
  const general = props.datosIndicador?.general_values;
  if (general && cuadro.field in general) return general[cuadro.field];
  return null;
}
</script>

<template>
  <section v-if="cuadrosOrdenados.length" class="cuadros-datos">
    <div class="cuadros-datos__grid">
      <TablerosCuadroDatos
        v-for="cuadro in cuadrosOrdenados"
        :key="cuadro.id"
        :cuadro="cuadro"
        :valor="obtenerValor(cuadro)"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cuadros-datos {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>
