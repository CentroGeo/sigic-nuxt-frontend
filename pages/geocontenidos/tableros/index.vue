<script setup>
const { status } = useAuth();
const { fetchSitios, eliminarSitio } = useTableroApi();
const { data: userData } = useAuth();

const estaLogueado = computed(() => status.value === 'authenticated');

const sitios = ref([]);
const estaCargando = ref(false);

async function cargarSitios() {
  estaCargando.value = true;
  try {
    const data = await fetchSitios();
    sitios.value = data.results || [];
  } catch (e) {
    console.error('Error al cargar sitios:', e);
  } finally {
    estaCargando.value = false;
  }
}

async function borrarSitio(id) {
  if (!confirm('¿Eliminar este tablero? Esta acción no se puede deshacer.')) return;
  const ok = await eliminarSitio(id, userData.value?.accessToken);
  if (ok) {
    sitios.value = sitios.value.filter((s) => s.id !== id);
  } else {
    alert('No se pudo eliminar el tablero.');
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

cargarSitios();
</script>

<template>
  <div>
    <div>
      <h2>Bienvenido a Tableros</h2>

      <p
        class="fondo-color-acento borde-redondeado-8 borde-l borde-grosor-4 p-4"
        style="border-color: var(--color-primario-4)"
      >
        Los Tableros de datos son sitios interactivos donde se presentan indicadores temáticos con
        mapas, gráficas y tarjetas de resumen, organizados en grupos y subgrupos.
      </p>

      <NuxtLink
        v-if="estaLogueado"
        to="/geocontenidos/tableros/nuevo"
        class="boton boton-primario m-b-4"
      >
        <span class="pictograma-agregar m-r-1" />
        Crear Tablero
      </NuxtLink>
    </div>

    <GeocontenidosLoader v-if="estaCargando" />

    <div v-else-if="sitios.length > 0" class="grid reticula-12">
      <div v-for="sitio in sitios" :key="sitio.id" class="columna-8 columna-4-esc">
        <div class="tarjeta">
          <div class="tarjeta-cuerpo">
            <p class="tarjeta-titulo">{{ sitio.name }}</p>

            <p v-if="sitio.subtitle" class="tarjeta-etiqueta">{{ sitio.subtitle }}</p>

            <p class="tarjeta-etiqueta">Creado: {{ formatearFecha(sitio.created_at) }}</p>
          </div>

          <div class="tarjeta-pie flex">
            <div class="fondo-color-acento borde borde-color-secundario borde-redondeado-8 m-t-2">
              <p class="m-1" style="display: flex; align-items: end; justify-content: center">
                <span class="pictograma-mapa-generador pictograma-mediano m-r-1" />
                <span
                  >URL: <b>/{{ sitio.url || sitio.id }}</b></span
                >
              </p>
            </div>

            <NuxtLink
              class="boton boton-chico boton-secundario"
              :to="`/tableros/${sitio.id}`"
              target="_blank"
            >
              <span class="pictograma-ojo-ver m-r-1" />
              Ver
            </NuxtLink>

            <template v-if="estaLogueado">
              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/tableros/${sitio.id}`"
              >
                <span class="pictograma-editar m-r-1" />
                Editar tablero
              </NuxtLink>

              <button class="boton boton-chico boton-primario" @click="borrarSitio(sitio.id)">
                <span class="pictograma-eliminar m-r-1" />
                Eliminar
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="texto-centrado">
      <p class="h3">No hay tableros disponibles.</p>
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
