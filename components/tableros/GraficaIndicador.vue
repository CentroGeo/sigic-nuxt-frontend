<script setup>
const props = defineProps({
  plotValues: {
    type: Array,
    default: null,
  },
  plotConfig: {
    type: Object,
    default: null,
  },
  customColors: {
    type: String,
    default: null,
  },
});

const barras = computed(() => {
  if (!props.plotConfig?.ranges) return [];
  return props.plotConfig.ranges.map((rango) => ({
    label: rango.alias || rango.label || `${rango.min} - ${rango.max}`,
    count: rango.count || 0,
    color: rango.color,
  }));
});

const maxConteo = computed(() => {
  if (!barras.value.length) return 1;
  return Math.max(...barras.value.map((b) => b.count), 1);
});
</script>

<template>
  <ClientOnly>
    <div v-if="barras.length" class="grafica-indicador">
      <p class="grafica-indicador__titulo">Distribución de Frecuencias</p>

      <div class="grafica-indicador__barras">
        <div v-for="(barra, idx) in barras" :key="idx" class="grafica-indicador__barra-grupo">
          <div class="grafica-indicador__barra-contenedor">
            <div
              class="grafica-indicador__barra"
              :style="{
                height: `${(barra.count / maxConteo) * 100}%`,
                backgroundColor: barra.color,
              }"
            />
          </div>
          <span class="grafica-indicador__barra-etiqueta">{{ barra.count }}</span>
        </div>
      </div>

      <div class="grafica-indicador__etiquetas">
        <span v-for="(barra, idx) in barras" :key="idx" class="grafica-indicador__etiqueta">
          {{ barra.label }}
        </span>
      </div>
    </div>

    <div v-else class="grafica-indicador grafica-indicador--vacia">
      <p>Sin datos de distribución disponibles</p>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.grafica-indicador {
  padding: 1rem;

  &__titulo {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__barras {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 180px;
  }

  &__barra-grupo {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  &__barra-contenedor {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  &__barra {
    width: 100%;
    border-radius: 2px 2px 0 0;
    min-height: 2px;
    transition: height 0.3s ease;
  }

  &__barra-etiqueta {
    font-size: 0.7rem;
    margin-top: 0.25rem;
    color: var(--tablero-interface-text, #666);
  }

  &__etiquetas {
    display: flex;
    gap: 4px;
    margin-top: 0.25rem;
  }

  &__etiqueta {
    flex: 1;
    font-size: 0.65rem;
    text-align: center;
    color: var(--tablero-interface-text, #666);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--vacia {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #999;
  }
}
</style>
