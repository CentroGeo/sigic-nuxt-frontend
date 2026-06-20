<script setup>
const props = defineProps({
  schema: { type: Array, default: () => [] },
  geoStrategy: { type: String, default: 'none' },
  specs: { type: Array, default: () => [] },
  defaultCol: { type: String, default: '' },
});

const emit = defineEmits(['update:specs', 'update:defaultCol']);

const RAMPS = {
  sequential: [
    {
      name: 'YlOrRd',
      label: 'Amarillo → Rojo',
      colors: [
        '#FFFFCC',
        '#FFEDA0',
        '#FED976',
        '#FEB24C',
        '#FD8D3C',
        '#FC4E2A',
        '#E31A1C',
        '#BD0026',
        '#800026',
      ],
    },
    {
      name: 'YlGnBu',
      label: 'Amarillo → Azul',
      colors: [
        '#FFFFD9',
        '#EDF8B1',
        '#C7E9B4',
        '#7FCDBB',
        '#41B6C4',
        '#1D91C0',
        '#225EA8',
        '#253494',
        '#081D58',
      ],
    },
    {
      name: 'Blues',
      label: 'Azules',
      colors: [
        '#F7FBFF',
        '#DEEBF7',
        '#C6DBEF',
        '#9ECAE1',
        '#6BAED6',
        '#4292C6',
        '#2171B5',
        '#08519C',
        '#08306B',
      ],
    },
    {
      name: 'Greens',
      label: 'Verdes',
      colors: [
        '#F7FCF5',
        '#E5F5E0',
        '#C7E9C0',
        '#A1D99B',
        '#74C476',
        '#41AB5D',
        '#238B45',
        '#006D2C',
        '#00441B',
      ],
    },
    {
      name: 'Reds',
      label: 'Rojos',
      colors: [
        '#FFF5F0',
        '#FEE0D2',
        '#FCBBA1',
        '#FC9272',
        '#FB6A4A',
        '#EF3B2C',
        '#CB181D',
        '#A50F15',
        '#67000D',
      ],
    },
    {
      name: 'OrRd',
      label: 'Naranja → Rojo',
      colors: [
        '#FFF7EC',
        '#FEE8C8',
        '#FDD49E',
        '#FDBB84',
        '#FC8D59',
        '#EF6548',
        '#D7301F',
        '#B30000',
        '#7F0000',
      ],
    },
    {
      name: 'BuPu',
      label: 'Azul → Morado',
      colors: [
        '#F7FCFD',
        '#E0ECF4',
        '#BFD3E6',
        '#9EBCDA',
        '#8C96C6',
        '#8C6BB1',
        '#88419D',
        '#810F7C',
        '#4D004B',
      ],
    },
    {
      name: 'PuRd',
      label: 'Morado → Rojo',
      colors: [
        '#F7F4F9',
        '#E7E1EF',
        '#D4B9DA',
        '#C994C7',
        '#DF65B0',
        '#E7298A',
        '#CE1256',
        '#980043',
        '#67001F',
      ],
    },
  ],
  diverging: [
    {
      name: 'RdYlGn',
      label: 'Rojo → Verde',
      colors: [
        '#D73027',
        '#F46D43',
        '#FDAE61',
        '#FEE08B',
        '#FFFFBF',
        '#D9EF8B',
        '#A6D96A',
        '#66BD63',
        '#1A9850',
      ],
    },
    {
      name: 'RdBu',
      label: 'Rojo → Azul',
      colors: [
        '#B2182B',
        '#D6604D',
        '#F4A582',
        '#FDDBC7',
        '#F7F7F7',
        '#D1E5F0',
        '#92C5DE',
        '#4393C3',
        '#2166AC',
      ],
    },
    {
      name: 'PuOr',
      label: 'Morado → Naranja',
      colors: [
        '#B35806',
        '#E08214',
        '#FDB863',
        '#FEE0B6',
        '#F7F7F7',
        '#D8DAEB',
        '#B2ABD2',
        '#8073AC',
        '#542788',
      ],
    },
    {
      name: 'BrBG',
      label: 'Café → Azul-verde',
      colors: [
        '#8C510A',
        '#BF812D',
        '#DFC27D',
        '#F6E8C3',
        '#F5F5F5',
        '#C7EAE5',
        '#80CDC1',
        '#35978F',
        '#01665E',
      ],
    },
  ],
  qualitative: [
    {
      name: 'Set1',
      label: 'Set1 — Vivos',
      colors: [
        '#E41A1C',
        '#377EB8',
        '#4DAF4A',
        '#984EA3',
        '#FF7F00',
        '#FFFF33',
        '#A65628',
        '#F781BF',
        '#999999',
      ],
    },
    {
      name: 'Set2',
      label: 'Set2 — Suaves',
      colors: [
        '#66C2A5',
        '#FC8D62',
        '#8DA0CB',
        '#E78AC3',
        '#A6D854',
        '#FFD92F',
        '#E5C494',
        '#B3B3B3',
      ],
    },
    {
      name: 'Set3',
      label: 'Set3 — Pastel',
      colors: [
        '#8DD3C7',
        '#FFFFB3',
        '#BEBADA',
        '#FB8072',
        '#80B1D3',
        '#FDB462',
        '#B3DE69',
        '#FCCDE5',
        '#D9D9D9',
        '#BC80BD',
        '#CCEBC5',
        '#FFED6F',
      ],
    },
    {
      name: 'Paired',
      label: 'Paired — Pares',
      colors: [
        '#A6CEE3',
        '#1F78B4',
        '#B2DF8A',
        '#33A02C',
        '#FB9A99',
        '#E31A1C',
        '#FDBF6F',
        '#FF7F00',
        '#CAB2D6',
        '#6A3D9A',
      ],
    },
    {
      name: 'Pastel1',
      label: 'Pastel1',
      colors: [
        '#FBB4AE',
        '#B3CDE3',
        '#CCEBC5',
        '#DECBE4',
        '#FED9A6',
        '#FFFFCC',
        '#E5D8BD',
        '#FDDAEC',
        '#F2F2F2',
      ],
    },
  ],
};

const GEO_ROLES = new Set(['lat', 'lon', 'state_key', 'mun_key', 'state_name', 'mun_name']);

// Patrón de nombres que sugieren identificador sin valor visual
const _ID_PATTERN =
  /^_?id$|_id$|^pk$|^fid$|^ogc_fid$|^folio$|^uuid$|^guid$|^cod(?:igo)?$|^clave$|^cve$|^code$|^num(?:ero)?$|^no(?:_|$)/i;

const RAZONES_DESACTIVADO = {
  id: 'Parece un identificador — no aporta valor visual',
  sequential: 'Valores secuenciales (probable ID automático)',
  low_confidence: 'Tipo de columna incierto',
  all_unique_text: 'Todos los valores son distintos (probable código único)',
};

/**
 * Retorna el motivo por el que la columna debería estar desactivada por defecto,
 * o null si debe estar activa.
 */
function razonDesactivado(col) {
  const name = (col.name || '').toLowerCase().trim();
  const type = col.editable_type || col.detected_type;
  const samples = (col.sample_values || []).map(String).filter(Boolean);

  if (_ID_PATTERN.test(name)) return 'id';

  if (col.confidence === 'low') return 'low_confidence';

  // Enteros secuenciales (auto-increment)
  if (type === 'entero' && samples.length >= 3) {
    const nums = samples.map(Number).filter((n) => !isNaN(n));
    if (nums.length >= 3 && nums.slice(1).every((v, i) => v === nums[i] + 1)) return 'sequential';
  }

  // Texto con todos los valores distintos (código único, folio libre, etc.)
  if (type === 'texto' && samples.length >= 4) {
    const unicos = new Set(samples);
    if (unicos.size === samples.length) return 'all_unique_text';
  }

  return null;
}

const styleableColumns = computed(() =>
  props.schema.filter((col) => {
    if (!col.name) return false;
    const t = col.editable_type || col.detected_type;
    if (t === 'ignorar' || t === 'fecha' || t === 'booleano') return false;
    if (col.geo_role && GEO_ROLES.has(col.geo_role)) return false;
    return t === 'entero' || t === 'decimal' || t === 'texto';
  })
);

const localSpecs = ref({});

const enabledCols = computed(() =>
  Object.values(localSpecs.value)
    .filter((s) => s.enabled)
    .map((s) => s.col)
);

watch(
  styleableColumns,
  (cols) => {
    const next = {};
    cols.forEach((col) => {
      const t = col.editable_type || col.detected_type;
      const isNumeric = t === 'entero' || t === 'decimal';
      const existing = props.specs.find((s) => s.col === col.name);
      // Si ya existe una spec guardada por el usuario, la respetamos íntegra.
      // `enabled: true` porque si estaba en specs es porque el usuario la activó.
      // Si es nueva, el default de enabled depende de la heurística.
      next[col.name] = existing
        ? { ...existing, enabled: true }
        : {
            col: col.name,
            label: col.name,
            type: isNumeric ? 'graduated' : 'categorical',
            palette: isNumeric ? 'YlOrRd' : 'Set1',
            n_classes: 5,
            classification: 'quantile',
            reverse: false,
            enabled: !razonDesactivado(col),
          };
    });
    localSpecs.value = next;
    emitSpecs();
  },
  { immediate: true }
);

function emitSpecs() {
  const specs = Object.values(localSpecs.value)
    .filter((s) => s.enabled)
    // eslint-disable-next-line no-unused-vars
    .map(({ enabled, ...rest }) => rest);
  emit('update:specs', specs);

  // If the current defaultCol is no longer enabled, reset to first enabled column
  if (!enabledCols.value.includes(props.defaultCol)) {
    emit('update:defaultCol', enabledCols.value[0] ?? '');
  }
}

function updateSpec(colName, patch) {
  localSpecs.value[colName] = { ...localSpecs.value[colName], ...patch };
  emitSpecs();
}

function availableRamps(colName) {
  const spec = localSpecs.value[colName];
  if (!spec) return RAMPS.qualitative;
  if (spec.type === 'categorical') return RAMPS.qualitative;
  return [...RAMPS.sequential, ...RAMPS.diverging];
}

const SEQUENTIAL_NAMES = new Set([
  'YlOrRd',
  'YlGnBu',
  'Blues',
  'Greens',
  'Reds',
  'OrRd',
  'BuPu',
  'PuRd',
]);
const DIVERGING_NAMES = new Set(['RdYlGn', 'RdBu', 'PuOr', 'BrBG']);
const QUALITATIVE_NAMES = new Set(['Set1', 'Set2', 'Set3', 'Paired', 'Pastel1']);

function paletteGroups(colName) {
  const ramps = availableRamps(colName);
  return [
    { key: 'Secuenciales', ramps: ramps.filter((r) => SEQUENTIAL_NAMES.has(r.name)) },
    { key: 'Divergentes', ramps: ramps.filter((r) => DIVERGING_NAMES.has(r.name)) },
    { key: 'Cualitativas', ramps: ramps.filter((r) => QUALITATIVE_NAMES.has(r.name)) },
  ].filter((g) => g.ramps.length > 0);
}

function swatchColors(paletteName, reverse = false) {
  const all = [...RAMPS.sequential, ...RAMPS.diverging, ...RAMPS.qualitative];
  const ramp = all.find((r) => r.name === paletteName);
  if (!ramp) return [];
  const colors = ramp.colors;
  const result =
    colors.length <= 7
      ? [...colors]
      : Array.from({ length: 7 }, (_, i) => colors[Math.round((i * (colors.length - 1)) / 6)]);
  return reverse ? [...result].reverse() : result;
}
</script>

<template>
  <section v-if="styleableColumns.length > 0 && geoStrategy !== 'none'" class="estilos-columnas">
    <h3 class="m-b-1">Estilos de visualización</h3>
    <p class="texto-chico texto-color-secundario m-b-3">
      Configura cómo se verá cada columna en el mapa. Las paletas se aplicarán automáticamente al
      dataset en GeoNode.
    </p>

    <div
      v-for="col in styleableColumns"
      :key="col.name"
      class="estilo-fila"
      :class="{ deshabilitada: !localSpecs[col.name]?.enabled }"
    >
      <div class="estilo-header">
        <div class="estilo-header-izq">
          <strong>{{ col.name }}</strong>
          <span class="etiqueta-tipo">{{ col.editable_type || col.detected_type }}</span>
          <label
            v-if="localSpecs[col.name]?.enabled"
            class="radio-defecto"
            :title="
              props.defaultCol === col.name
                ? 'Estilo por defecto'
                : 'Establecer como estilo por defecto'
            "
          >
            <input
              type="radio"
              name="default-style"
              :value="col.name"
              :checked="
                props.defaultCol === col.name || (!props.defaultCol && enabledCols[0] === col.name)
              "
              @change="emit('update:defaultCol', col.name)"
            />
            <span class="radio-defecto-label">Por defecto</span>
          </label>
        </div>
        <button
          type="button"
          class="toggle-estilo"
          :class="{ activo: localSpecs[col.name]?.enabled }"
          :aria-pressed="localSpecs[col.name]?.enabled"
          :aria-label="`${localSpecs[col.name]?.enabled ? 'Excluir' : 'Incluir'} estilo para ${col.name}`"
          @click="updateSpec(col.name, { enabled: !localSpecs[col.name]?.enabled })"
        >
          {{ localSpecs[col.name]?.enabled ? '✓ Incluido' : 'Excluido' }}
        </button>
      </div>

      <p v-if="!localSpecs[col.name]?.enabled && razonDesactivado(col)" class="hint-desactivado">
        {{ RAZONES_DESACTIVADO[razonDesactivado(col)] }}
      </p>

      <template v-if="localSpecs[col.name]?.enabled">
        <div class="estilo-controles">
          <div class="campo-chico campo-etiqueta-estilo">
            <label class="etiqueta-chica" :for="`lbl-${col.name}`">Etiqueta visible</label>
            <input
              :id="`lbl-${col.name}`"
              type="text"
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.label ?? col.name"
              :placeholder="col.name"
              @input="updateSpec(col.name, { label: $event.target.value || col.name })"
            />
          </div>

          <div class="campo-chico">
            <label class="etiqueta-chica">Tipo</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.type"
              @change="
                updateSpec(col.name, {
                  type: $event.target.value,
                  palette:
                    $event.target.value === 'categorical'
                      ? 'Set1'
                      : localSpecs[col.name]?.palette === 'Set1'
                        ? 'YlOrRd'
                        : (localSpecs[col.name]?.palette ?? 'YlOrRd'),
                })
              "
            >
              <option value="categorical">Categorizado</option>
              <option
                v-if="['entero', 'decimal'].includes(col.editable_type || col.detected_type)"
                value="graduated"
              >
                Graduado (color)
              </option>
              <option
                v-if="
                  ['entero', 'decimal'].includes(col.editable_type || col.detected_type) &&
                  geoStrategy === 'lat_lon'
                "
                value="graduated_size"
              >
                Graduado (tamaño y color)
              </option>
            </select>
          </div>

          <div
            v-if="['graduated', 'graduated_size'].includes(localSpecs[col.name]?.type)"
            class="campo-chico"
          >
            <label class="etiqueta-chica">Clasificación</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.classification"
              @change="updateSpec(col.name, { classification: $event.target.value })"
            >
              <option value="quantile">Cuantiles</option>
              <option value="equal_interval">Intervalos iguales</option>
            </select>
          </div>

          <div
            v-if="['graduated', 'graduated_size'].includes(localSpecs[col.name]?.type)"
            class="campo-chico"
          >
            <label class="etiqueta-chica">Clases</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.n_classes"
              @change="updateSpec(col.name, { n_classes: Number($event.target.value) })"
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>

          <div v-if="localSpecs[col.name]?.type === 'graduated_size'" class="campo-chico">
            <label class="etiqueta-chica">Tamaño mín (px)</label>
            <input
              type="number"
              class="campo-texto campo-texto-chico campo-numero"
              min="3"
              max="30"
              :value="localSpecs[col.name]?.size_min ?? 6"
              @input="updateSpec(col.name, { size_min: Number($event.target.value) })"
            />
          </div>

          <div v-if="localSpecs[col.name]?.type === 'graduated_size'" class="campo-chico">
            <label class="etiqueta-chica">Tamaño máx (px)</label>
            <input
              type="number"
              class="campo-texto campo-texto-chico campo-numero"
              min="8"
              max="60"
              :value="localSpecs[col.name]?.size_max ?? 24"
              @input="updateSpec(col.name, { size_max: Number($event.target.value) })"
            />
          </div>

          <div class="campo-chico campo-paleta">
            <label class="etiqueta-chica">Paleta</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.palette"
              @change="updateSpec(col.name, { palette: $event.target.value })"
            >
              <optgroup
                v-for="group in paletteGroups(col.name)"
                :key="group.key"
                :label="group.key"
              >
                <option v-for="ramp in group.ramps" :key="ramp.name" :value="ramp.name">
                  {{ ramp.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="campo-chico campo-invertir">
            <label class="etiqueta-chica" :for="`rev-${col.name}`">Invertir</label>
            <input
              :id="`rev-${col.name}`"
              type="checkbox"
              class="checkbox-invertir"
              :checked="localSpecs[col.name]?.reverse ?? false"
              @change="updateSpec(col.name, { reverse: $event.target.checked })"
            />
          </div>

          <div class="paleta-preview" aria-hidden="true">
            <span
              v-for="(color, ci) in swatchColors(
                localSpecs[col.name]?.palette ?? '',
                localSpecs[col.name]?.reverse ?? false
              )"
              :key="ci"
              class="swatch"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.estilos-columnas {
  margin-top: 1.5rem;
}

.estilo-fila {
  border: 1px solid var(--color-borde, #ddd);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: opacity 0.15s;

  &.deshabilitada {
    opacity: 0.45;
  }
}

.estilo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.estilo-header-izq {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  strong {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.radio-defecto {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--color-texto-secundario, #666);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--color-borde, #ddd);
  transition:
    background 0.1s,
    border-color 0.1s;

  &:has(input:checked) {
    background: var(--color-secundario-3, #f8e1e8);
    border-color: var(--color-primario-4, #991f47);
    color: var(--color-primario-4, #991f47);
    font-weight: 600;
  }

  input[type='radio'] {
    width: 13px;
    height: 13px;
    accent-color: var(--color-primario-4, #991f47);
    margin: 0;
  }
}

.etiqueta-tipo {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--color-fondo-secundario, #eee);
  color: var(--color-texto-secundario, #555);
}

.toggle-estilo {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid currentColor;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  background: transparent;
  color: var(--color-texto-secundario, #888);

  &.activo {
    background: var(--color-primario-4, #991f47);
    border-color: var(--color-primario-4, #991f47);
    color: #fff;
  }

  &:not(.activo) {
    background: transparent;
    border-color: var(--color-borde, #ccc);
    color: var(--color-texto-secundario, #888);
  }
}

.estilo-controles {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  padding-top: 4px;
}

.campo-chico {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.etiqueta-chica {
  font-size: 0.75rem;
  color: var(--color-texto-secundario, #666);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.campo-texto-chico {
  padding: 6px 10px;
  font-size: 0.95rem;
  height: 40px;
  min-width: 140px;
}

.campo-etiqueta-estilo {
  flex: 1 1 200px;

  input {
    width: 100%;
  }
}

.campo-numero {
  min-width: 80px;
  max-width: 100px;
}

.campo-invertir {
  align-items: center;
  justify-content: center;

  .checkbox-invertir {
    width: 18px;
    height: 18px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-primario-4, #991f47);
  }
}

.paleta-preview {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 4px;
}

.swatch {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 3px;
}

.cursor-pointer {
  cursor: pointer;
}

.hint-desactivado {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--color-texto-secundario, #888);
  font-style: italic;
}
</style>
