<script setup>
const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
  indicadores: {
    type: Array,
    default: () => [],
  },
  grupos: {
    type: Array,
    default: () => [],
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['crear', 'eliminar']);

const { data: userData } = useAuth();
const { eliminarIndicador, recalcularIndicador } = useTableroApi();

const filtro = ref('');
const filtroGrupo = ref('');
const mostrarModalNuevo = ref(false);
const indicadorEditando = ref(null);
const recalculandoId = ref(null);
const mensajeRecalculo = ref('');

const filtrados = computed(() => {
  let lista = props.indicadores;
  if (filtroGrupo.value) {
    lista = lista.filter((i) => String(i.group) === String(filtroGrupo.value));
  }
  if (!filtro.value) return lista;
  const t = filtro.value.toLowerCase();
  return lista.filter((i) => i.name?.toLowerCase().includes(t));
});

async function quitar(id) {
  if (!confirm('¿Eliminar este indicador?')) return;
  const ok = await eliminarIndicador(id, userData.value?.accessToken);
  if (ok) emit('eliminar');
}

function alCrear() {
  mostrarModalNuevo.value = false;
  emit('crear');
}

function alGuardarEdicion() {
  indicadorEditando.value = null;
  emit('crear'); // recarga la lista
}

async function recalcular(ind) {
  recalculandoId.value = ind.id;
  mensajeRecalculo.value = '';
  try {
    const result = await recalcularIndicador(ind.id, userData.value?.accessToken);
    if (result?.status === 'ok') {
      mensajeRecalculo.value = `✓ ${ind.name}: ${result.rangos} rangos calculados`;
      emit('crear'); // recarga la lista para actualizar el badge
    } else {
      mensajeRecalculo.value = `Error: ${result?.error || 'No se pudo recalcular'}`;
    }
  } catch (e) {
    mensajeRecalculo.value = `Error: ${e?.message || 'Error de conexión'}`;
  } finally {
    recalculandoId.value = null;
    setTimeout(() => {
      mensajeRecalculo.value = '';
    }, 4000);
  }
}
</script>

<template>
  <div class="repo-indicadores">
    <div class="repo-indicadores__toolbar">
      <input
        v-model="filtro"
        type="search"
        placeholder="Buscar indicador..."
        class="repo-indicadores__buscar"
      />
      <select
        v-if="grupos.length"
        v-model="filtroGrupo"
        class="repo-indicadores__filtro-grupo"
        title="Filtrar por grupo"
      >
        <option value="">Todos los grupos</option>
        <option v-for="g in grupos" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>
      <button
        type="button"
        class="boton boton-primario boton-chico"
        @click="mostrarModalNuevo = true"
      >
        <span class="pictograma-agregar m-r-1" />
        Nuevo indicador
      </button>
    </div>

    <GeocontenidosLoader v-if="cargando" mensaje="Cargando indicadores..." />

    <p v-else-if="!filtrados.length" class="formulario-ayuda">
      {{ filtro ? 'Sin coincidencias.' : 'No hay indicadores aún. Crea uno para empezar.' }}
    </p>

    <ul v-else class="repo-indicadores__lista">
      <li
        v-for="ind in filtrados"
        :key="ind.id"
        class="repo-indicadores__item"
        :draggable="true"
        @dragstart="(ev) => ev.dataTransfer.setData('indicator-id', String(ind.id))"
      >
        <div class="repo-indicadores__nombre">
          <strong>{{ ind.name }}</strong>
          <span
            v-if="ind.plot_values || ind.map_values"
            class="repo-indicadores__estado repo-indicadores__estado--ok"
            >configurado</span
          >
          <span v-else class="repo-indicadores__estado">sin datos</span>
        </div>
        <div class="repo-indicadores__acciones">
          <button
            type="button"
            class="boton boton-secundario boton-chico"
            title="Recalcular datos desde el dataset"
            :disabled="recalculandoId === ind.id"
            @click="recalcular(ind)"
          >
            <span
              class="pictograma-actualizar"
              :class="{ 'repo-indicadores__spin': recalculandoId === ind.id }"
            />
          </button>
          <button
            type="button"
            class="boton boton-secundario boton-chico"
            title="Editar indicador"
            @click="indicadorEditando = ind"
          >
            <span class="pictograma-editar" />
          </button>
          <button type="button" class="boton boton-secundario boton-chico" @click="quitar(ind.id)">
            <span class="pictograma-eliminar" />
          </button>
        </div>
      </li>
    </ul>

    <p v-if="mensajeRecalculo" class="repo-indicadores__feedback">{{ mensajeRecalculo }}</p>

    <TablerosAdminModalNuevoIndicador
      v-if="mostrarModalNuevo"
      :site-id="siteId"
      @creado="alCrear"
      @cerrar="mostrarModalNuevo = false"
    />

    <TablerosAdminFormularioIndicador
      v-if="indicadorEditando"
      :indicador="indicadorEditando"
      @guardado="alGuardarEdicion"
      @cerrar="indicadorEditando = null"
    />
  </div>
</template>

<style lang="scss" scoped>
.repo-indicadores {
  &__toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__buscar {
    flex: 1;
  }

  &__filtro-grupo {
    max-width: 160px;
  }

  &__lista {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.4rem;
    background: var(--color-fondo-1, #ffffff);
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
    cursor: grab;
    color: #111;

    &:hover {
      border-color: var(--color-primario, #691c32);
    }
  }

  &__nombre {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
    overflow: hidden;

    strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__acciones {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  &__estado {
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    background: var(--color-neutro-2, #e0e0e0);

    &--ok {
      background: #2e7d32;
      color: white;
    }
  }

  &__feedback {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    background: var(--color-fondo-2, #f5f5f5);
    border: 1px solid var(--color-neutro-2, #e0e0e0);
  }

  &__spin {
    display: inline-block;
    animation: girar 0.8s linear infinite;
  }
}

@keyframes girar {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
