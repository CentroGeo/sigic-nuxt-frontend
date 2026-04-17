<script setup>
const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { fetchIndicadores, fetchCuadrosDatos, eliminarCuadroDatos } = useTableroApi();

const indicadores = ref([]);
const indicadorActivo = ref(null);
const cuadros = ref([]);
const cargandoIndicadores = ref(false);
const cargandoCuadros = ref(false);
const mostrarFormulario = ref(false);
const cuadroEditando = ref(null);

const MAX_CUADROS = 8;

async function cargarIndicadores() {
  cargandoIndicadores.value = true;
  try {
    const data = await fetchIndicadores(props.siteId);
    indicadores.value = data.results || [];
    if (indicadores.value.length && !indicadorActivo.value) {
      indicadorActivo.value = indicadores.value[0].id;
    }
  } catch (e) {
    console.error('Error al cargar indicadores:', e);
  } finally {
    cargandoIndicadores.value = false;
  }
}

async function cargarCuadros() {
  if (!indicadorActivo.value) {
    cuadros.value = [];
    return;
  }
  cargandoCuadros.value = true;
  try {
    const data = await fetchCuadrosDatos(indicadorActivo.value);
    cuadros.value = data.results || data || [];
  } catch (e) {
    console.error('Error al cargar cuadros:', e);
  } finally {
    cargandoCuadros.value = false;
  }
}

watch(indicadorActivo, cargarCuadros);

async function borrarCuadro(id) {
  if (!confirm('¿Eliminar este cuadro de datos?')) return;
  const ok = await eliminarCuadroDatos(id, userData.value?.accessToken);
  if (ok) cuadros.value = cuadros.value.filter((c) => c.id !== id);
}

function editarCuadro(cuadro) {
  cuadroEditando.value = cuadro;
  mostrarFormulario.value = true;
}

function crearCuadro() {
  cuadroEditando.value = null;
  mostrarFormulario.value = true;
}

function alGuardarCuadro() {
  mostrarFormulario.value = false;
  cuadroEditando.value = null;
  cargarCuadros();
}

onMounted(cargarIndicadores);
</script>

<template>
  <div class="tab-datos">
    <GeocontenidosLoader v-if="cargandoIndicadores" mensaje="Cargando indicadores..." />

    <p v-else-if="!indicadores.length" class="formulario-ayuda">
      Aún no hay indicadores. Crea uno desde la pestaña Estructura.
    </p>

    <template v-else>
      <div class="tab-datos__selector m-b-3">
        <label for="tab-datos-indicador">Indicador</label>
        <select id="tab-datos-indicador" v-model="indicadorActivo">
          <option v-for="ind in indicadores" :key="ind.id" :value="ind.id">
            {{ ind.name }}
          </option>
        </select>
      </div>

      <div class="tab-datos__acciones m-b-3">
        <button
          type="button"
          class="boton boton-primario"
          :disabled="cuadros.length >= MAX_CUADROS"
          @click="crearCuadro"
        >
          <span class="pictograma-agregar m-r-1" />
          Crear cuadro de datos
        </button>
        <span class="formulario-ayuda">{{ cuadros.length }} / {{ MAX_CUADROS }} cuadros</span>
      </div>

      <GeocontenidosLoader v-if="cargandoCuadros" mensaje="Cargando cuadros..." />

      <p v-else-if="!cuadros.length" class="formulario-ayuda">
        Este indicador aún no tiene cuadros de datos.
      </p>

      <div v-else class="tab-datos__grid">
        <article
          v-for="cuadro in cuadros"
          :key="cuadro.id"
          class="tab-datos__tarjeta"
          :style="{
            background: cuadro.color,
            color: cuadro.text_color,
            borderColor: cuadro.edge_color,
          }"
        >
          <header>
            <span v-if="cuadro.icon" :class="cuadro.icon" class="tab-datos__icono" />
            <h4>{{ cuadro.name }}</h4>
          </header>

          <p class="tab-datos__campo">Campo: {{ cuadro.field }}</p>
          <p v-if="cuadro.is_percentage" class="tab-datos__badge">Porcentual</p>

          <footer>
            <button
              type="button"
              class="boton boton-secundario boton-chico"
              @click="editarCuadro(cuadro)"
            >
              Editar
            </button>
            <button
              type="button"
              class="boton boton-primario boton-chico"
              @click="borrarCuadro(cuadro.id)"
            >
              Eliminar
            </button>
          </footer>
        </article>
      </div>

      <TablerosAdminFormularioCuadroDatos
        v-if="mostrarFormulario && indicadorActivo"
        :indicador-id="indicadorActivo"
        :cuadro="cuadroEditando"
        @guardado="alGuardarCuadro"
        @cerrar="mostrarFormulario = false"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.tab-datos {
  &__selector {
    label {
      display: block;
      margin-bottom: 0.3rem;
    }
  }

  &__acciones {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  &__tarjeta {
    padding: 1rem;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;

    header {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h4 {
        margin: 0;
      }
    }

    footer {
      display: flex;
      gap: 0.3rem;
      margin-top: 0.75rem;
    }
  }

  &__icono {
    font-size: 1.5rem;
  }

  &__campo {
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
  }

  &__badge {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    font-size: 0.75rem;
    margin-top: 0.3rem;
  }
}
</style>
