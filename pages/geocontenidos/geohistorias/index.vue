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
      <h2>Bienvenido a Escenarios</h2>

      <p
        class="fondo-color-acento borde-redondeado-8 borde-l borde-grosor-4 p-4"
        style="border-color: var(--color-primario-4)"
      >
        Los Escenarios son presentaciones interactivas dónde puedes mostrar mapas que cuentan una
        historia con capas de información y texto descriptivo.
      </p>

      <NuxtLink to="/geocontenidos/geohistorias/editar" class="boton boton-primario m-b-4">
        <span class="pictograma-agregar m-r-1" />
        Crear Escenario
      </NuxtLink>
    </div>

    <GeocontenidosLoader v-if="estaCargando" />

    <div v-else-if="escenarios.length > 0" class="grid reticula-12">
      <div v-for="escenario in escenarios" :key="escenario.id" class="columna-8 columna-4-esc">
        <div class="tarjeta">
          <div class="tarjeta-cuerpo">
            <p class="tarjeta-titulo">{{ escenario.name }}</p>

            <p class="tarjeta-etiqueta">Creado: {{ escenario.created_at }}</p>
          </div>

          <div class="tarjeta-pie flex">
            <button class="boton boton-chico boton-secundario m-t-3">
              <span class="pictograma-ojo-ver m-r-1" />
              Ver
            </button>

            <NuxtLink
              class="boton boton-chico boton-secundario"
              to="/geocontenidos/geohistorias/editar"
            >
              <span class="pictograma-editar m-r-1" />
              Editar escenario
            </NuxtLink>

            <NuxtLink
              class="boton boton-chico boton-secundario"
              to="/geocontenidos/geohistorias/escenas"
            >
              <span class="pictograma-editar m-r-1" />
              Editar escenas
            </NuxtLink>
            <button class="boton boton-chico boton-secundario">
              <span class="pictograma-agregar m-r-1" />
              Crear escena
            </button>
            <button class="boton boton-chico boton-primario">
              <span class="pictograma-eliminar m-r-1" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="texto-centrado">
      <p class="h3">No hay escenarios disponibles.</p>
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
