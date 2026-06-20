<script setup>
const props = defineProps({
  jobs: { type: Array, default: () => [] },
  eliminando: { type: Number, default: null },
  cargando: { type: Boolean, default: false },
});

const emit = defineEmits(['retomar', 'eliminar']);

const pestanaActiva = ref('proceso');

const ESTADO = {
  pending: { label: 'En espera', clase: 'estado--espera' },
  analyzing: { label: 'Analizando archivo', clase: 'estado--espera' },
  ready: { label: 'Listo para importar', clase: 'estado--info' },
  importing: { label: 'Importando a GeoNode', clase: 'estado--espera' },
  done: { label: 'Completado', clase: 'estado--ok' },
  error: { label: 'Error', clase: 'estado--error' },
};

function estadoInfo(job) {
  return ESTADO[job.status] ?? { label: job.status, clase: 'estado--info' };
}

const jobsProceso = computed(() => props.jobs.filter((j) => j.status !== 'done'));
const jobsCompletados = computed(() => props.jobs.filter((j) => j.status === 'done'));
const jobsActivos = computed(() =>
  pestanaActiva.value === 'proceso' ? jobsProceso.value : jobsCompletados.value
);

function formatFecha(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <section class="jobs-pendientes">
    <h3 class="jobs-pendientes__titulo">Importaciones recientes</h3>

    <div class="pestanas" role="tablist">
      <button
        role="tab"
        :aria-selected="pestanaActiva === 'proceso'"
        class="pestana"
        :class="{ 'pestana--activa': pestanaActiva === 'proceso' }"
        @click="pestanaActiva = 'proceso'"
      >
        En proceso
        <span v-if="jobsProceso.length" class="pestana-badge">{{ jobsProceso.length }}</span>
      </button>
      <button
        role="tab"
        :aria-selected="pestanaActiva === 'completados'"
        class="pestana"
        :class="{ 'pestana--activa': pestanaActiva === 'completados' }"
        @click="pestanaActiva = 'completados'"
      >
        Completados
        <span v-if="jobsCompletados.length" class="pestana-badge pestana-badge--ok">{{
          jobsCompletados.length
        }}</span>
      </button>
    </div>

    <p v-if="cargando" class="jobs-vacio">Cargando...</p>
    <p v-else-if="jobsActivos.length === 0" class="jobs-vacio">
      {{
        pestanaActiva === 'proceso'
          ? 'Sin importaciones en proceso.'
          : 'Sin importaciones completadas.'
      }}
    </p>

    <ul v-else class="jobs-lista">
      <li v-for="job in jobsActivos" :key="job.id" class="job-fila">
        <span class="estado" :class="estadoInfo(job).clase">{{ estadoInfo(job).label }}</span>

        <div class="job-info">
          <span class="job-nombre" :title="job.original_filename">{{ job.original_filename }}</span>
          <span class="job-fecha">{{ formatFecha(job.updated_at) }}</span>
        </div>

        <div class="job-acciones">
          <NuxtLink
            v-if="job.status === 'done' && job.dashboard_site_id"
            :to="`/geocontenidos/tableros/${job.dashboard_site_id}`"
            class="boton boton-chico boton-secundario"
          >
            Ver tablero
          </NuxtLink>
          <button
            v-else
            type="button"
            class="boton boton-chico boton-secundario"
            @click="emit('retomar', job.id)"
          >
            Retomar
          </button>
          <button
            type="button"
            class="boton boton-chico boton-peligro"
            :disabled="eliminando === job.id"
            @click="emit('eliminar', job.id)"
          >
            {{ eliminando === job.id ? '...' : 'Eliminar' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.jobs-pendientes {
  margin-top: 2rem;

  &__titulo {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    color: var(--color-texto-secundario, #555);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

/* Pestañas */
.pestanas {
  display: flex;
  gap: 2px;
  border-bottom: 2px solid var(--color-borde, #e0e0e0);
  margin-bottom: 0.75rem;
}

.pestana {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: var(--color-texto-secundario, #777);
  transition: color 0.15s;

  &:hover {
    color: var(--color-secundario-9, #53323c);
  }

  &--activa {
    color: var(--color-primario-4, #991f47);
    border-bottom-color: var(--color-primario-4, #991f47);
    font-weight: 600;
  }
}

.pestana-badge {
  font-size: 0.7rem;
  background: var(--color-secundario-7, #876670);
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  line-height: 1.4;

  &--ok {
    background: var(--color-primario-4, #991f47);
  }
}

/* Lista */
.jobs-lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-fila {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border: 1px solid var(--color-borde, #e8e8e8);
  border-radius: 5px;
  background: var(--color-fondo-2, #fafafa);
  flex-wrap: wrap;
}

.job-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.job-nombre {
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.job-fecha {
  font-size: 0.72rem;
  color: var(--color-texto-secundario, #999);
  white-space: nowrap;
  flex-shrink: 0;
}

.job-acciones {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Estados */
.estado {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;

  &--ok {
    background: var(--color-secundario-3, #f8e1e8);
    color: var(--color-secundario-10, #44242c);
  }
  &--espera {
    background: #f0f0f0;
    color: #555;
  }
  &--info {
    background: var(--color-secundario-4, #f5d4dd);
    color: var(--color-primario-4, #991f47);
  }
  &--error {
    background: var(--color-secundario-10, #44242c);
    color: #fff;
  }
}

.jobs-vacio {
  font-size: 0.82rem;
  color: var(--color-texto-secundario, #999);
  margin: 0.4rem 0 0;
  padding: 0.5rem 0;
}

.boton-peligro {
  background: transparent;
  border: 1px solid var(--color-primario-4, #991f47);
  color: var(--color-primario-4, #991f47);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--color-secundario-3, #f8e1e8);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
</style>
