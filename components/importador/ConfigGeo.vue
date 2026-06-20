<script setup>
const props = defineProps({
  schema: { type: Array, default: () => [] },
  geoStrategy: { type: String, default: 'none' },
  geoFieldLat: { type: String, default: '' },
  geoFieldLon: { type: String, default: '' },
  geoFieldJoin: { type: String, default: '' },
});

const emit = defineEmits([
  'update:geoStrategy',
  'update:geoFieldLat',
  'update:geoFieldLon',
  'update:geoFieldJoin',
]);

const STRATEGIES = [
  { value: 'latlon', label: 'Capa de puntos — columnas lat/lon del archivo' },
  { value: 'inegi_mun_key', label: 'Capa de municipios — clave INEGI (5 dígitos)' },
  { value: 'inegi_state_key', label: 'Capa de estados — clave INEGI (2 dígitos)' },
  { value: 'mun_name', label: 'Capa de municipios — nombre de municipio' },
  { value: 'state_name', label: 'Capa de estados — nombre de estado' },
  { value: 'none', label: 'Sin geometría (solo gráficas)' },
];

const columnNames = computed(() => props.schema.map((c) => c.name));

const needsLatLon = computed(() => props.geoStrategy === 'latlon');
const needsJoinField = computed(() =>
  ['inegi_mun_key', 'inegi_state_key', 'mun_name', 'state_name'].includes(props.geoStrategy)
);

const joinFieldLabel = computed(() => {
  const map = {
    inegi_mun_key: 'Columna con clave INEGI municipio (5 dígitos)',
    inegi_state_key: 'Columna con clave INEGI estado (2 dígitos)',
    mun_name: 'Columna con nombre de municipio',
    state_name: 'Columna con nombre de estado',
  };
  return map[props.geoStrategy] || 'Columna de unión geográfica';
});
</script>

<template>
  <div class="config-geo">
    <div class="campo m-b-3">
      <label class="etiqueta">Estrategia geográfica</label>
      <select
        :value="geoStrategy"
        class="campo-texto"
        @change="emit('update:geoStrategy', $event.target.value)"
      >
        <option v-for="s in STRATEGIES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <template v-if="needsLatLon">
      <p class="texto-chico texto-color-secundario m-t-1 m-b-2">
        Se creará una capa de puntos usando las coordenadas de cada registro. No requiere capas de
        referencia adicionales.
      </p>
      <div class="campos-latlon">
        <div class="campo">
          <label class="etiqueta">Columna de latitud</label>
          <select
            :value="geoFieldLat"
            class="campo-texto selector-columna"
            @change="emit('update:geoFieldLat', $event.target.value)"
          >
            <option value="">— seleccionar columna —</option>
            <option v-for="c in columnNames" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="campo">
          <label class="etiqueta">Columna de longitud</label>
          <select
            :value="geoFieldLon"
            class="campo-texto selector-columna"
            @change="emit('update:geoFieldLon', $event.target.value)"
          >
            <option value="">— seleccionar columna —</option>
            <option v-for="c in columnNames" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </template>

    <template v-if="needsJoinField">
      <div class="campo">
        <label class="etiqueta">{{ joinFieldLabel }}</label>
        <select
          :value="geoFieldJoin"
          class="campo-texto selector-columna"
          @change="emit('update:geoFieldJoin', $event.target.value)"
        >
          <option value="">— seleccionar columna —</option>
          <option v-for="c in columnNames" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <p class="texto-chico texto-color-secundario m-t-1">
        El sistema usará las capas MGN INEGI precargadas para asignar geometría a cada registro. Los
        datos sin coincidencia geográfica quedarán sin geometría en el mapa.
      </p>
    </template>

    <div v-if="geoStrategy === 'none'" class="alerta alerta-informacion m-t-2">
      <span class="pictograma-informacion" />
      <p class="m-0">
        Sin geometría: el tablero mostrará solo gráficas estadísticas, sin mapa temático.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.campos-latlon {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.selector-columna {
  min-width: 12rem;
  width: 100%;
}

@media (max-width: 640px) {
  .campos-latlon {
    grid-template-columns: 1fr;
  }
}
</style>
