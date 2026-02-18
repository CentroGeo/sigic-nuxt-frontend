<script setup>
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();

const escenarios = ref([]);
const estaCargando = ref(false);

async function cargarEscenarios() {
  estaCargando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/`);

  const data = await respuesta.json();
  escenarios.value = data.results;
  estaCargando.value = false;
}
cargarEscenarios();
</script>

<template>
  <div>
    <div>
      <div class="flex p-y-3">
        <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario boton-chico">
          <span class="pictograma-flecha-izquierda m-r-1" />
        </NuxtLink>

        <h2 class="m-0">Escenas creadas</h2>
        <!-- / Agregar capas / Agregar marcadores / Edición de Escenas -->
      </div>
    </div>

    <div>
      <NuxtLink to="/geocontenidos/geohistorias/escena" class="boton boton-primario m-b-4">
        <span class="pictograma-agregar m-r-1" />
        Crear Escena
      </NuxtLink>
    </div>

    <GeocontenidosLoader v-if="estaCargando" />

    <template v-else-if="escenarios.length > 0">
      <div class="grid reticula-12">
        <div v-for="escenario in escenarios" :key="escenario.id" class="columna-8 columna-4-esc">
          <div class="tarjeta">
            <div class="tarjeta-cuerpo">
              <p class="tarjeta-titulo">Nombre de la Escena</p>
            </div>

            <div class="tarjeta-pie flex">
              <button class="boton boton-chico boton-secundario m-t-3">
                <span class="pictograma-agregar m-r-1" />
                Agregar capas
              </button>

              <button class="boton boton-chico boton-secundario">
                <span class="pictograma-agregar m-r-1" />
                Agregar marcadores
              </button>

              <button class="boton boton-chico boton-secundario">
                <span class="pictograma-editar m-r-1" />
                Editar escena
              </button>

              <button class="boton boton-chico boton-primario">
                <span class="pictograma-eliminar m-r-1" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-contenido-final">
        <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario">
          Cancelar
        </NuxtLink>
        <button class="boton-primario">Guardar</button>
        <!-- <button class="boton-primario">Guardar y Editar escenas</button> -->
      </div>
    </template>

    <div v-else class="texto-centrado">
      <p class="h3">No hay escenas disponibles.</p>
    </div>
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
