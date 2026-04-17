<script setup>
defineProps({
  nombre: {
    type: String,
    default: '',
  },
  datos: {
    type: Object,
    default: null,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <section class="tablero-indicador">
    <header v-if="nombre" class="tablero-indicador__encabezado">
      <h2 class="tablero-indicador__titulo">{{ nombre }}</h2>
      <p v-if="datos?.info_text" class="tablero-indicador__info">{{ datos.info_text }}</p>
    </header>

    <TablerosLoader v-if="cargando" mensaje="Cargando indicador..." />

    <template v-else-if="datos">
      <div class="tablero-indicador__visual">
        <div class="tablero-indicador__mapa">
          <TablerosMapaIndicador
            :map-values="datos.map_values"
            :plot-config="datos.plot_config"
            :layer-id-field="datos.layer_id_field"
            :use-filter="datos.use_filter"
            :filters="datos.filters"
          />
        </div>

        <div class="tablero-indicador__grafica">
          <TablerosGraficaIndicador
            :plot-values="datos.plot_values"
            :plot-config="datos.plot_config"
            :custom-colors="datos.custom_colors"
          />
        </div>
      </div>

      <TablerosCuadrosDatos
        v-if="datos.info_boxes?.length"
        :cuadros="datos.info_boxes"
        :datos-indicador="datos"
      />
    </template>

    <div v-else class="tablero-indicador__vacio">
      <p>Selecciona un indicador para visualizarlo.</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.tablero-indicador {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  &__encabezado {
    margin-bottom: 1rem;
  }

  &__titulo {
    margin: 0;
    font-size: 1.5rem;
    color: var(--tablero-interface-text, inherit);
  }

  &__info {
    margin: 0.5rem 0 0;
    color: var(--tablero-interface-text, inherit);
    opacity: 0.85;
    font-size: 0.9rem;
  }

  &__visual {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    background: var(--tablero-interface-bg, #ffffff);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  &__vacio {
    text-align: center;
    padding: 3rem;
    color: #999;
  }
}
</style>
