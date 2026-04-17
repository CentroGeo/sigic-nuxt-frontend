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
  cargando: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['crear', 'eliminar']);

const { data: userData } = useAuth();
const { eliminarIndicador } = useTableroApi();

const filtro = ref('');
const mostrarModalNuevo = ref(false);

const filtrados = computed(() => {
  if (!filtro.value) return props.indicadores;
  const t = filtro.value.toLowerCase();
  return props.indicadores.filter((i) => i.name?.toLowerCase().includes(t));
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
          <button type="button" class="boton boton-secundario boton-chico" @click="quitar(ind.id)">
            <span class="pictograma-eliminar" />
          </button>
        </div>
      </li>
    </ul>

    <TablerosAdminModalNuevoIndicador
      v-if="mostrarModalNuevo"
      :site-id="siteId"
      @creado="alCrear"
      @cerrar="mostrarModalNuevo = false"
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

  &__lista {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
}
</style>
