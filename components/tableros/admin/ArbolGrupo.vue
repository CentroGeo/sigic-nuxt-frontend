<script setup>
const props = defineProps({
  grupo: {
    type: Object,
    required: true,
  },
  indicadoresSitio: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['eliminar', 'cambio']);

const { data: userData } = useAuth();
const {
  crearSubgrupo,
  eliminarSubgrupo,
  actualizarIndicador,
  fetchSubgrupos,
  fetchIndicadoresPorGrupo,
  fetchIndicadoresPorSubgrupo,
} = useTableroApi();

const expandido = ref(true);
const mostrarFormSubgrupo = ref(false);
const nuevoSubgrupo = reactive({ name: '', info_text: '', icon: '' });
const detalle = ref(null);
const cargandoDetalle = ref(false);

async function cargarDetalle() {
  cargandoDetalle.value = true;
  try {
    const [subgruposData, indDirectosData] = await Promise.all([
      fetchSubgrupos(props.grupo.id),
      fetchIndicadoresPorGrupo(props.grupo.id),
    ]);

    const subgrupos = subgruposData.results || [];
    const indicadoresDirectos = indDirectosData.results || [];

    const subgruposConIndicadores = await Promise.all(
      subgrupos.map(async (sg) => {
        const indsData = await fetchIndicadoresPorSubgrupo(sg.id);
        return { ...sg, indicators: indsData.results || [] };
      })
    );

    detalle.value = {
      subgroups: subgruposConIndicadores,
      indicators: indicadoresDirectos,
    };
  } catch (e) {
    console.error('Error al cargar detalle:', e);
  } finally {
    cargandoDetalle.value = false;
  }
}

async function agregarSubgrupo() {
  if (!nuevoSubgrupo.name) return;
  const form = new FormData();
  form.append('group', String(props.grupo.id));
  form.append('name', nuevoSubgrupo.name);
  if (nuevoSubgrupo.info_text) form.append('info_text', nuevoSubgrupo.info_text);
  if (nuevoSubgrupo.icon) form.append('icon', nuevoSubgrupo.icon);

  const data = await crearSubgrupo(form, userData.value?.accessToken);
  if (data?.id) {
    nuevoSubgrupo.name = '';
    nuevoSubgrupo.info_text = '';
    nuevoSubgrupo.icon = '';
    mostrarFormSubgrupo.value = false;
    await cargarDetalle();
    emit('cambio');
  }
}

async function borrarSubgrupo(id) {
  if (!confirm('¿Eliminar este subgrupo?')) return;
  const ok = await eliminarSubgrupo(id, userData.value?.accessToken);
  if (ok) {
    await cargarDetalle();
    emit('cambio');
  }
}

async function onDropGrupo(ev) {
  const indicadorId = ev.dataTransfer.getData('indicator-id');
  if (!indicadorId) return;
  await actualizarIndicador(
    Number(indicadorId),
    { group: props.grupo.id, subgroup: null, site: null },
    userData.value?.accessToken
  );
  await cargarDetalle();
  emit('cambio');
}

async function onDropSubgrupo(ev, subgrupoId) {
  const indicadorId = ev.dataTransfer.getData('indicator-id');
  if (!indicadorId) return;
  await actualizarIndicador(
    Number(indicadorId),
    { subgroup: subgrupoId, group: null, site: null },
    userData.value?.accessToken
  );
  await cargarDetalle();
  emit('cambio');
}

async function desasignar(indicadorId) {
  await actualizarIndicador(
    indicadorId,
    { group: null, subgroup: null, site: props.grupo.site },
    userData.value?.accessToken
  );
  await cargarDetalle();
  emit('cambio');
}

onMounted(cargarDetalle);
</script>

<template>
  <div class="arbol-grupo">
    <header class="arbol-grupo__header">
      <button type="button" class="arbol-grupo__toggle" @click="expandido = !expandido">
        <span>{{ expandido ? '▼' : '▶' }}</span>
        <strong>{{ grupo.name }}</strong>
      </button>

      <div class="arbol-grupo__acciones">
        <button
          type="button"
          class="boton boton-secundario boton-chico"
          @click="mostrarFormSubgrupo = !mostrarFormSubgrupo"
        >
          + Subgrupo
        </button>
        <button type="button" class="boton boton-primario boton-chico" @click="emit('eliminar')">
          <span class="pictograma-eliminar" />
        </button>
      </div>
    </header>

    <div v-if="expandido" class="arbol-grupo__drop" @dragover.prevent @drop.prevent="onDropGrupo">
      <form v-if="mostrarFormSubgrupo" class="arbol-grupo__form" @submit.prevent="agregarSubgrupo">
        <input
          v-model="nuevoSubgrupo.name"
          type="text"
          placeholder="Nombre del subgrupo"
          required
        />
        <input v-model="nuevoSubgrupo.icon" type="text" placeholder="Icono (clase Font Awesome)" />
        <input type="submit" class="boton boton-primario boton-chico" value="Crear" />
      </form>

      <div v-if="cargandoDetalle">Cargando...</div>

      <div v-else>
        <ul v-if="detalle?.indicators?.length" class="arbol-grupo__items">
          <li v-for="ind in detalle.indicators" :key="ind.id">
            <span class="pictograma-reporte m-r-1" />
            {{ ind.name }}
            <button
              type="button"
              class="boton boton-secundario boton-chico m-l-1"
              @click="desasignar(ind.id)"
            >
              Quitar
            </button>
          </li>
        </ul>

        <ul v-if="detalle?.subgroups?.length" class="arbol-grupo__subgrupos">
          <li
            v-for="sg in detalle.subgroups"
            :key="sg.id"
            class="arbol-grupo__subgrupo"
            @dragover.prevent
            @drop.prevent="onDropSubgrupo($event, sg.id)"
          >
            <header>
              <span v-if="sg.icon" :class="sg.icon" />
              <strong>{{ sg.name }}</strong>
              <button
                type="button"
                class="boton boton-primario boton-chico"
                @click="borrarSubgrupo(sg.id)"
              >
                <span class="pictograma-eliminar" />
              </button>
            </header>
            <ul v-if="sg.indicators?.length">
              <li v-for="ind in sg.indicators" :key="ind.id">
                <span class="pictograma-reporte m-r-1" />
                {{ ind.name }}
                <button
                  type="button"
                  class="boton boton-secundario boton-chico m-l-1"
                  @click="desasignar(ind.id)"
                >
                  Quitar
                </button>
              </li>
            </ul>
            <p v-else class="formulario-ayuda">Arrastra indicadores aquí.</p>
          </li>
        </ul>

        <p
          v-if="!detalle?.indicators?.length && !detalle?.subgroups?.length"
          class="formulario-ayuda"
        >
          Grupo vacío. Arrastra indicadores desde el repositorio o crea un subgrupo.
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.arbol-grupo {
  background: var(--color-fondo-1, #ffffff);
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  border-radius: 6px;
  margin-bottom: 0.75rem;
  color: #111;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
  }

  &__toggle {
    background: none;
    border: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    color: inherit;
  }

  &__acciones {
    display: flex;
    gap: 0.25rem;
  }

  &__drop {
    padding: 0.5rem 0.75rem 0.75rem;
    border-top: 1px dashed var(--color-neutro-2, #e0e0e0);
    min-height: 60px;
  }

  &__form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    input[type='text'] {
      flex: 1;
    }
  }

  &__items,
  &__subgrupos {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__subgrupo {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--color-fondo-2, #fafafa);
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 4px;
    color: #111;

    header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      padding: 0.25rem 0;
    }
  }
}
</style>
