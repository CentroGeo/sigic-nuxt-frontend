<script setup>
const mapasStore = useMapasStore();
const { status } = useAuth();

const estaLogueado = computed(() => status.value === 'authenticated');

const modalCrear = ref(null);
const paginaActual = ref(0);
const inputBusqueda = ref('');
const seleccionOrden = ref('titulo');

async function cargar(pagina) {
  // Sin filtro is_public: el backend devuelve los públicos a cualquiera y, si
  // hay sesión, también los privados del dueño (get_queryset).
  await mapasStore.cargarMapas({ page: pagina + 1 });
}

const totalMapas = computed(() => mapasStore.pagination.total ?? 0);

const totalPags = computed(() =>
  Math.max(1, Math.ceil((mapasStore.pagination.total || 0) / mapasStore.pagination.page_size))
);

/**
 * Filtrado y orden del lado del cliente sobre la página cargada.
 * (La búsqueda actúa sobre los resultados de la página actual.)
 */
const mapasFiltrados = computed(() => {
  const termino = inputBusqueda.value.trim().toLowerCase();
  let lista = mapasStore.maps;
  if (termino) {
    lista = lista.filter((m) => (m.name || '').toLowerCase().includes(termino));
  }
  return [...lista].sort((a, b) => {
    switch (seleccionOrden.value) {
      case 'titulo':
        return (a.name || '').localeCompare(b.name || '');
      case 'fecha_descendente':
        return (b.id ?? 0) - (a.id ?? 0);
      case 'fecha_ascendente':
        return (a.id ?? 0) - (b.id ?? 0);
      default:
        return 0;
    }
  });
});

function limpiarBusqueda() {
  inputBusqueda.value = '';
}

function alCrear(mapa) {
  navigateTo(`/geocontenidos/mapas/${mapa.id}/editar`);
}

watch(paginaActual, (p) => cargar(p));

onMounted(() => {
  cargar(paginaActual.value);
  modalCrear.value?.abrir();
});
</script>

<template>
  <main id="principal" class="contenedor m-b-10">
    <h1>Mapas</h1>

    <div class="flex m-t-2">
      <button v-if="estaLogueado" class="boton-primario" type="button" @click="modalCrear?.abrir()">
        Crear Mapa
      </button>
    </div>

    <MapasModalCrearMapa ref="modalCrear" @creado="alCrear" />

    <!-- <NuxtLink
      v-if="estaLogueado"
      to="/geocontenidos/mapas/crear"
      class="boton boton-primario m-b-4"
    >
      <span class="pictograma-agregar m-r-1" aria-hidden="true" />
      Crear mapa
    </NuxtLink> -->

    <div class="flex">
      <!-- Selector Orden -->
      <div class="columna-8">
        <ClientOnly>
          <label for="selector-orden-mapas-geocontenidos">Ordenar por</label>
          <select
            id="selector-orden-mapas-geocontenidos"
            v-model="seleccionOrden"
            name="selector-orden-mapas-geocontenidos"
            class="m-b-2"
            :disabled="mapasStore.isLoading"
          >
            <option value="titulo">Título</option>
            <option value="fecha_descendente">Más Reciente</option>
            <option value="fecha_ascendente">Más Antiguo</option>
          </select>
        </ClientOnly>
      </div>
      <!-- Campo de búsqueda -->
      <div class="columna-8">
        <div class="flex flex-contenido-separado">
          <div class="columna-16">
            <ClientOnly>
              <label for="busqueda-mapas-geocontenidos"> Campo de búsqueda </label>
              <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                <input
                  id="busqueda-mapas-geocontenidos"
                  v-model="inputBusqueda"
                  type="search"
                  class="campo-busqueda-entrada"
                  placeholder="Campo de búsqueda"
                  :disabled="mapasStore.isLoading"
                />

                <button
                  style="margin: 0; margin-right: 4px"
                  class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                  aria-label="Borrar"
                  type="button"
                  :disabled="mapasStore.isLoading"
                  @click="limpiarBusqueda"
                >
                  <span aria-hidden="true" class="pictograma-cerrar" />
                </button>

                <button
                  class="boton-primario boton-pictograma campo-busqueda-buscar"
                  aria-label="Buscar"
                  type="button"
                  :disabled="mapasStore.isLoading"
                >
                  <span class="pictograma-buscar" aria-hidden="true" />
                </button>
              </form>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>

    <div class="flex">
      <h2>Mapas</h2>
      <UiNumeroElementos :numero="totalMapas" />
    </div>

    <GeocontenidosLoader v-if="mapasStore.isLoading" />

    <div v-if="mapasFiltrados.length === 0 && !mapasStore.isLoading" class="flex">
      <div
        class="flex flex-contenido-centrado columna-16 borde-redondeado-16 m-2 fondo-color-informacion texto-color-informacion p-2"
      >
        <p class="nota texto-color-informacion m-2">
          No se encontraron resultados que coincidan con la búsqueda.
        </p>
      </div>
    </div>

    <template v-if="mapasFiltrados.length !== 0 && !mapasStore.isLoading">
      <ClientOnly>
        <div class="flex flex-contenido-inicio">
          <MapasTarjetaMapa v-for="mapa in mapasFiltrados" :key="mapa.id" :mapa="mapa" />
        </div>

        <UiPaginador
          :pagina-parent="paginaActual"
          :total-paginas="totalPags"
          @cambio="paginaActual = $event"
        />
      </ClientOnly>
    </template>
  </main>
</template>
