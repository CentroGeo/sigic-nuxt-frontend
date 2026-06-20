<script setup>
const props = defineProps({
  schema: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:schema']);

const TIPOS = ['texto', 'entero', 'decimal', 'fecha', 'booleano', 'ignorar'];

const GEO_ROLES = {
  lat: 'Latitud',
  lon: 'Longitud',
  state_key: 'Clave estado INEGI',
  mun_key: 'Clave municipio INEGI',
  state_name: 'Nombre estado',
  mun_name: 'Nombre municipio',
};

function onChangeType(index, value) {
  const updated = props.schema.map((col, i) =>
    i === index ? { ...col, editable_type: value } : col
  );
  emit('update:schema', updated);
}

function confidenceLabel(c) {
  return c === 'high' ? 'Alta' : c === 'medium' ? 'Media' : 'Baja';
}

function confidenceClass(c) {
  return c === 'high'
    ? 'texto-color-exito'
    : c === 'medium'
      ? 'texto-color-advertencia'
      : 'texto-color-error';
}
</script>

<template>
  <div class="tabla-esquema">
    <p class="m-b-2 texto-chico">
      Revisa y corrige los tipos de columna detectados. Las columnas con confianza baja o
      advertencias requieren atención especial.
    </p>
    <div class="tabla-desbordable">
      <table class="tabla tabla-condensada">
        <thead>
          <tr>
            <th>Columna</th>
            <th>Tipo detectado</th>
            <th>Confianza</th>
            <th>Rol geo</th>
            <th>Muestra</th>
            <th>Editar tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(col, idx) in schema"
            :key="col.name"
            :class="{ 'fila-advertencia': col.warning }"
          >
            <td>
              <strong>{{ col.name }}</strong>
            </td>
            <td>{{ col.detected_type }}</td>
            <td :class="confidenceClass(col.confidence)">
              {{ confidenceLabel(col.confidence) }}
            </td>
            <td>
              <span v-if="col.geo_role" class="etiqueta etiqueta-primaria texto-chico">
                {{ GEO_ROLES[col.geo_role] || col.geo_role }}
              </span>
            </td>
            <td class="texto-chico texto-color-secundario">
              {{ col.sample_values.slice(0, 3).join(', ') }}
            </td>
            <td class="celda-selector">
              <select
                :value="col.editable_type"
                class="campo-texto campo-chico selector-tipo"
                @change="onChangeType(idx, $event.target.value)"
              >
                <option v-for="t in TIPOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="schema.some((c) => c.warning)" class="alerta alerta-advertencia m-t-2">
      <span class="pictograma-alerta" />
      <div>
        <p v-for="col in schema.filter((c) => c.warning)" :key="col.name" class="m-0 texto-chico">
          <strong>{{ col.name }}:</strong> {{ col.warning }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabla-desbordable {
  overflow-x: auto;
}
.fila-advertencia {
  background-color: var(--color-advertencia-claro, #fff8e1);
}
.celda-selector {
  white-space: nowrap;
}
.selector-tipo {
  min-width: 9rem;
  width: 100%;
}
</style>
