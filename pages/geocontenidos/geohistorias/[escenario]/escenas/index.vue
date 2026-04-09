<script setup>
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { data: userData } = useAuth();
const { status } = useAuth();
const estaLogueado = computed(() => status.value === 'authenticated');
const { escenario } = useRoute().params;

const escenas = ref([]);
const estaCargando = ref(false);

async function cargarEscenas() {
  estaCargando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/${escenario}/scenes/`);

  const data = await respuesta.json();
  escenas.value = Object.fromEntries(data.map((escena) => [escena.id, escena]));
  estaCargando.value = false;

  // console.log(data);
}
cargarEscenas();

function alIniciarArrastre({ dataTransfer }, idArrastre, posicionArrastre) {
  dataTransfer.setData('idArrastre', idArrastre);
  dataTransfer.setData('posicionArrastre', posicionArrastre);
}
function alSoltar(event, idQuitar, posicionQuitar) {
  event.preventDefault();
  const idArrastre = event.dataTransfer.getData('idArrastre');
  const posicionArrastre = Number(event.dataTransfer.getData('posicionArrastre'));

  // [x[0], x[2]] = [x[2], x[0]]
  [escenas.value[idArrastre].stack_order, escenas.value[idQuitar].stack_order] = [
    posicionQuitar,
    posicionArrastre,
  ];
}

async function guardarCambios() {
  const formulario = Object.values(escenas.value).map(({ id, stack_order }) => ({
    id,
    stack_order,
  }));
  // console.log(formulario);

  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenes/bulk-reorder//`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(formulario),
  });

  const data = await respuesta.json();
  console.log(data);
}

function Eliminar(id) {
  console.log('Eliminar', id);
}
</script>

<template>
  <div>
    <div>
      <div class="flex p-y-3">
        <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario boton-chico">
          <span class="pictograma-flecha-izquierda m-r-1" />
        </NuxtLink>

        <h2 class="m-0">Escenas</h2>
        <!-- / Agregar capas / Agregar marcadores / Edición de Escenas -->
      </div>
    </div>

    <div class="flex flex-contenido-separado m-b-4">
      <NuxtLink
        v-if="estaLogueado"
        :to="`/geocontenidos/geohistorias/${escenario}/escenas/nuevo/editar`"
        class="boton boton-primario"
      >
        <span class="pictograma-agregar m-r-1" />
        Crear Escena
      </NuxtLink>

      <NuxtLink class="boton boton-secundario" :to="`/geohistorias/${escenario}`" target="_blank">
        <span class="pictograma-mapa-generador m-r-1" />
        Visualizar escenario
      </NuxtLink>
    </div>

    <GeocontenidosLoader v-if="estaCargando" />

    <div v-else-if="escenas.length === 0" class="texto-centrado">
      <p class="h3">No hay escenas disponibles.</p>
    </div>

    <template v-else>
      <div class="grid reticula-12 m-b-4">
        <div
          v-for="escena in Object.values(escenas).sort((a, b) => a.stack_order - b.stack_order)"
          :key="escena.id"
          class="columna-8 columna-4-esc"
          @drop="alSoltar($event, escena.id, escena.stack_order)"
          @dragover="$event.preventDefault()"
        >
          <div
            :id="escena.id"
            class="tarjeta"
            draggable="true"
            @dragstart="alIniciarArrastre($event, escena.id, escena.stack_order)"
          >
            <div class="tarjeta-cuerpo flex flex-contenido-separado">
              <p class="tarjeta-titulo">{{ escena.name }}</p>

              <button class="boton boton-chico boton-primario" style="margin-top: 0">
                <span class="pictograma-mover pictograma-grande" style="padding: 0" />
              </button>
            </div>

            <div class="tarjeta-pie flex m-t-3">
              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario}/escenas/${escena.id}/editar`"
              >
                <span class="pictograma-editar m-r-1" />
                Editar escena
              </NuxtLink>

              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario}/escenas/${escena.id}/capas`"
              >
                <span :class="`pictograma-${escena.layers.length ? 'editar' : 'agregar'} m-r-1`" />
                {{ escena.layers.length ? 'Editar' : 'Agregar' }} capas
              </NuxtLink>

              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario}/escenas/${escena.id}/marcadores`"
              >
                <span :class="`pictograma-${escena.markers.length ? 'editar' : 'agregar'} m-r-1`" />
                {{ escena.markers.length ? 'Editar' : 'Agregar' }} marcadores
              </NuxtLink>

              <button class="boton boton-chico boton-primario" @click="Eliminar(escena.id)">
                <span class="pictograma-eliminar m-r-1" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <section class="flex flex-contenido-final">
        <button class="boton-primario" @click="guardarCambios">Guardar orden</button>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.modulo-geocontenidos .contenedor {
  .grid.reticula-12 {
    grid-template-columns: repeat(12, 1fr);
  }
  .tarjeta {
    &-cuerpo {
      background-color: var(--color-primario-4);
      color: var(--texto-inverso);
    }
    &-pie {
      flex-direction: column;
      button,
      a {
        display: block;
      }
    }
  }
}
</style>
