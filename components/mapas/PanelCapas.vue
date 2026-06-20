<script setup>
const props = defineProps({
  capas: {
    type: Array,
    default: () => [],
  },
  editable: {
    type: Boolean,
    default: false,
  },
  mapa: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  'toggle',
  'opacidad',
  'reordenar',
  'eliminar',
  'agregar',
  'vista',
  'guardar-vista',
]);

const vista = reactive({
  zoom: 5,
  center_lat: -101.61,
  center_long: 22.21,
});

const vistaGuardada = reactive({
  zoom: 5,
  center_lat: -101.61,
  center_long: 22.21,
});

const guardandoVista = ref(false);

watch(
  () => props.mapa?.id,
  () => {
    const m = props.mapa;
    if (!m) return;
    vista.zoom = m.zoom ?? 5;
    vista.center_lat = m.center_lat ?? -101.61;
    vista.center_long = m.center_long ?? 22.21;
    vistaGuardada.zoom = vista.zoom;
    vistaGuardada.center_lat = vista.center_lat;
    vistaGuardada.center_long = vista.center_long;
  },
  { immediate: true }
);

watch(
  () => [props.mapa?.zoom, props.mapa?.center_lat, props.mapa?.center_long],
  ([z, lat, lng]) => {
    if (!props.mapa) return;
    if (z !== undefined && Number(z) !== Number(vista.zoom)) vista.zoom = z;
    if (lat !== undefined && Number(lat) !== Number(vista.center_lat)) vista.center_lat = lat;
    if (lng !== undefined && Number(lng) !== Number(vista.center_long)) vista.center_long = lng;
  }
);

const vistaSucia = computed(() => {
  const sucia =
    Number(vista.zoom) !== Number(vistaGuardada.zoom) ||
    Number(vista.center_lat) !== Number(vistaGuardada.center_lat) ||
    Number(vista.center_long) !== Number(vistaGuardada.center_long);
  return sucia;
});

function emitirVista() {
  const payload = {
    zoom: Number(vista.zoom),
    center_lat: Number(vista.center_lat),
    center_long: Number(vista.center_long),
  };
  emit('vista', payload);
}

async function guardarVista() {
  guardandoVista.value = true;
  const payload = {
    zoom: Math.round(Number(vista.zoom)),
    center_lat: Number(vista.center_lat),
    center_long: Number(vista.center_long),
  };
  emit('guardar-vista', payload);
  vistaGuardada.zoom = payload.zoom;
  vistaGuardada.center_lat = payload.center_lat;
  vistaGuardada.center_long = payload.center_long;
  guardandoVista.value = false;
}

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => b.stack_order - a.stack_order)
);

function alternarVisible(capa) {
  emit('toggle', { id: capa.id, visible: !capa.visible });
}

function cambiarOpacidad(capa, valor) {
  emit('opacidad', { id: capa.id, opacity: Number(valor) });
}

function moverArriba(index) {
  if (index === 0) return;
  const ordenadas = capasOrdenadas.value;
  const a = ordenadas[index];
  const b = ordenadas[index - 1];
  emit('reordenar', [
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

function moverAbajo(index) {
  const ordenadas = capasOrdenadas.value;
  if (index === ordenadas.length - 1) return;
  const a = ordenadas[index];
  const b = ordenadas[index + 1];
  emit('reordenar', [
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

function eliminar(capa) {
  if (!confirm(`¿Eliminar la capa "${capa.name}"?`)) return;
  emit('eliminar', capa.id);
}
</script>

<template>
  <aside class="panel-capas">
    <div class="panel-encabezado flex flex-contenido-separado">
      <h3 class="m-0">Capas</h3>
      <button
        v-if="editable"
        class="boton-secundario boton-chico"
        type="button"
        @click="emit('agregar')"
      >
        <span class="pictograma-mas" aria-hidden="true" /> Agregar
      </button>
    </div>

    <section v-if="editable && mapa" class="panel-vista">
      <div class="flex flex-contenido-separado vista-encabezado">
        <h4 class="m-0">Vista del mapa</h4>
        <button
          class="boton-primario boton-chico"
          type="button"
          :disabled="!vistaSucia || guardandoVista"
          @click="guardarVista"
        >
          {{ guardandoVista ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
      <div class="campo-vista">
        <label :for="`vista-zoom-${mapa.id}`" class="texto-secundario">
          Zoom: {{ Math.round(Number(vista.zoom)) }}
        </label>
        <input
          :id="`vista-zoom-${mapa.id}`"
          v-model.number="vista.zoom"
          type="range"
          min="0"
          max="20"
          step="1"
          @input="emitirVista"
        />
      </div>
      <div class="campo-vista">
        <label :for="`vista-lat-${mapa.id}`" class="texto-secundario">Centro (longitud)</label>
        <input
          :id="`vista-lat-${mapa.id}`"
          v-model.number="vista.center_lat"
          type="number"
          step="0.0001"
          @input="emitirVista"
        />
      </div>
      <div class="campo-vista">
        <label :for="`vista-long-${mapa.id}`" class="texto-secundario">Centro (latitud)</label>
        <input
          :id="`vista-long-${mapa.id}`"
          v-model.number="vista.center_long"
          type="number"
          step="0.0001"
          @input="emitirVista"
        />
      </div>
    </section>

    <p v-if="!capasOrdenadas.length" class="m-y-2 texto-secundario">Este mapa no tiene capas.</p>

    <ul class="lista-capas">
      <li v-for="(capa, idx) in capasOrdenadas" :key="capa.id" class="capa-item p-1">
        <div class="capa-cabecera flex flex-contenido-separado">
          <label class="capa-toggle flex">
            <input
              type="checkbox"
              :checked="capa.visible"
              :disabled="!editable"
              @change="alternarVisible(capa)"
            />
            <span class="capa-nombre">{{ capa.name }}</span>
          </label>

          <div class="capa-cabecera-acciones flex">
            <span
              v-if="capa.dataset_is_published != null"
              class="etiqueta-visibilidad"
              :class="capa.dataset_is_published ? 'es-publica' : 'es-privada'"
            >
              {{ capa.dataset_is_published ? 'Pública' : 'Privada' }}
            </span>
            <span v-if="capa.map_position" class="etiqueta-pos">
              {{ capa.map_position === 'left' ? 'Izq' : 'Der' }}
            </span>
            <button
              v-if="editable"
              class="boton-eliminar-capa"
              type="button"
              aria-label="Eliminar capa"
              @click="eliminar(capa)"
            >
              <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="capa-opacidad m-t-1">
          <label :for="`op-${capa.id}`" class="texto-secundario">
            Opacidad: {{ Math.round(capa.opacity * 100) }}%
          </label>
          <input
            :id="`op-${capa.id}`"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="capa.opacity"
            :disabled="!editable"
            @input="cambiarOpacidad(capa, $event.target.value)"
          />
        </div>

        <div v-if="editable" class="capa-acciones flex flex-contenido-final m-t-1">
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            :disabled="idx === 0"
            aria-label="Subir capa"
            type="button"
            @click="moverArriba(idx)"
          >
            <span class="pictograma-angulo-arriba" aria-hidden="true" />
          </button>
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            :disabled="idx === capasOrdenadas.length - 1"
            aria-label="Bajar capa"
            type="button"
            @click="moverAbajo(idx)"
          >
            <span class="pictograma-angulo-abajo" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
  </aside>
</template>

<style lang="scss" scoped>
.panel-capas {
  padding: 12px;
  background-color: var(--fondo);
  border-left: 1px solid var(--color-neutro-1);
  overflow-y: auto;
  height: 100%;
  max-width: 280px;
  min-width: 280px;
}

.panel-encabezado {
  align-items: center;
  margin-bottom: 12px;
}

.lista-capas {
  list-style: none;
  padding: 0;
  margin: 0;
}

.capa-item {
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: var(--fondo-acento);
}

.capa-toggle {
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.capa-nombre {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.etiqueta-pos {
  font-size: 0.75rem;
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  padding: 2px 6px;
  border-radius: 6px;
}

.etiqueta-visibilidad {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.etiqueta-visibilidad.es-publica {
  background-color: #d8f5dc;
  color: #16703c;
}

.etiqueta-visibilidad.es-privada {
  background-color: #fde2e1;
  color: #c0392b;
}

.capa-cabecera-acciones {
  align-items: center;
  gap: 6px;
}

.boton-eliminar-capa {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  color: #ff0000;
  background-color: var(--boton-primario-cursor-fondo);
  transition: background-color 0.15s ease;

  &:hover,
  &:focus-visible {
    background-color: #ffffff;
  }
}

.capa-opacidad input[type='range'] {
  width: 100%;
}

.panel-vista {
  padding: 8px 10px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  background-color: var(--fondo-acento);
  margin-bottom: 12px;
}

.campo-vista {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;

  input[type='range'],
  input[type='number'] {
    width: 100%;
  }
}

.flex {
  gap: 8px;
}
</style>
