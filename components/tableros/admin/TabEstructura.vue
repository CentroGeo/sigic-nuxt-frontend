<script setup>
const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { fetchGrupos, crearGrupo, eliminarGrupo, fetchIndicadores } = useTableroApi();

const grupos = ref([]);
const indicadoresSitio = ref([]);
const cargandoGrupos = ref(false);
const cargandoIndicadores = ref(false);
const mostrarFormGrupo = ref(false);
const nuevoGrupo = reactive({ name: '', description: '', info_text: '' });

async function cargarGrupos() {
  cargandoGrupos.value = true;
  try {
    const data = await fetchGrupos(props.siteId);
    grupos.value = data.results || [];
  } catch (e) {
    console.error('Error al cargar grupos:', e);
  } finally {
    cargandoGrupos.value = false;
  }
}

async function cargarIndicadores() {
  cargandoIndicadores.value = true;
  try {
    const data = await fetchIndicadores(props.siteId);
    indicadoresSitio.value = data.results || [];
  } catch (e) {
    console.error('Error al cargar indicadores:', e);
  } finally {
    cargandoIndicadores.value = false;
  }
}

async function agregarGrupo() {
  if (!nuevoGrupo.name) return;
  const payload = {
    site: props.siteId,
    name: nuevoGrupo.name,
    description: nuevoGrupo.description,
    info_text: nuevoGrupo.info_text,
    stack_order: grupos.value.length + 1,
  };
  const data = await crearGrupo(payload, userData.value?.accessToken);
  if (data?.id) {
    grupos.value.push(data);
    nuevoGrupo.name = '';
    nuevoGrupo.description = '';
    nuevoGrupo.info_text = '';
    mostrarFormGrupo.value = false;
  }
}

async function borrarGrupo(id) {
  if (!confirm('¿Eliminar este grupo y todos sus subgrupos/indicadores asociados?')) return;
  const ok = await eliminarGrupo(id, userData.value?.accessToken);
  if (ok) grupos.value = grupos.value.filter((g) => g.id !== id);
}

function recargarTodo() {
  cargarGrupos();
  cargarIndicadores();
}

onMounted(recargarTodo);
</script>

<template>
  <div class="tab-estructura">
    <div class="tab-estructura__panel">
      <header class="tab-estructura__header">
        <h3>Repositorio de indicadores</h3>
      </header>

      <TablerosAdminRepositorioIndicadores
        :site-id="siteId"
        :indicadores="indicadoresSitio"
        :cargando="cargandoIndicadores"
        @crear="recargarTodo"
        @eliminar="recargarTodo"
      />
    </div>

    <div class="tab-estructura__panel">
      <header class="tab-estructura__header">
        <h3>Estructura del sitio</h3>
        <button
          type="button"
          class="boton boton-secundario boton-chico"
          @click="mostrarFormGrupo = !mostrarFormGrupo"
        >
          <span class="pictograma-agregar m-r-1" />
          Nuevo grupo
        </button>
      </header>

      <form v-if="mostrarFormGrupo" class="tab-estructura__form" @submit.prevent="agregarGrupo">
        <div class="m-b-2">
          <label for="grupo-nombre">Nombre del grupo</label>
          <input id="grupo-nombre" v-model="nuevoGrupo.name" type="text" required />
        </div>
        <div class="m-b-2">
          <label for="grupo-descripcion">Descripción</label>
          <input id="grupo-descripcion" v-model="nuevoGrupo.description" type="text" />
        </div>
        <div class="m-b-2">
          <label for="grupo-info">Info</label>
          <textarea id="grupo-info" v-model="nuevoGrupo.info_text" rows="2" />
        </div>
        <div class="flex flex-contenido-final">
          <button type="button" class="boton boton-secundario" @click="mostrarFormGrupo = false">
            Cancelar
          </button>
          <input type="submit" class="boton boton-primario" value="Crear" />
        </div>
      </form>

      <GeocontenidosLoader v-if="cargandoGrupos" mensaje="Cargando estructura..." />

      <p v-else-if="!grupos.length" class="formulario-ayuda">
        Aún no hay grupos. Crea uno para empezar a organizar indicadores.
      </p>

      <ul v-else class="tab-estructura__grupos">
        <li v-for="grupo in grupos" :key="grupo.id">
          <TablerosAdminArbolGrupo
            :grupo="grupo"
            :indicadores-sitio="indicadoresSitio"
            @eliminar="borrarGrupo(grupo.id)"
            @cambio="recargarTodo"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-estructura {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  &__panel {
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 8px;
    padding: 1rem;
    background: var(--color-fondo-2, #fafafa);
    color: #111;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      margin: 0;
    }
  }

  &__form {
    padding: 1rem;
    margin-bottom: 1rem;
    background: var(--color-fondo-1, #ffffff);
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
  }

  &__grupos {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}
</style>
