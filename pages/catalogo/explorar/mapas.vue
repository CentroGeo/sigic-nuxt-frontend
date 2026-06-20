<script setup>
const config = useRuntimeConfig();
const mapasStore = useMapasStore();
const storeCatalogo = useCatalogoStore();
const { data: session } = useAuth();

const paginaActual = ref(0);
const inputBusqueda = ref('');
const seleccionOrden = ref('titulo');

async function cargar(pagina) {
  // Públicos para cualquiera y, si hay sesión, también los privados del usuario
  // (el backend resuelve la visibilidad en get_queryset).
  await mapasStore.cargarMapas({ page: pagina + 1 });
}

/**
 * ¿El mapa pertenece a la persona autenticada?
 */
function esPropio(m) {
  const ownerUsername = m.owner?.username;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === session.value.user?.email || ownerUsername === session.value.user?.name;
}

/**
 * Visible en el catálogo: públicos + privados del propio usuario.
 * Excluye privados de terceros (p. ej. los que un superusuario podría recibir).
 */
function esVisible(m) {
  return m.is_public !== false || esPropio(m);
}

const totalMapas = computed(() => mapasStore.maps.filter(esVisible).length);

const totalPags = computed(() =>
  Math.max(1, Math.ceil((mapasStore.pagination.total || 0) / mapasStore.pagination.page_size))
);

/**
 * Filtrado y orden del lado del cliente sobre la página cargada.
 * (La búsqueda actúa sobre los resultados de la página actual.)
 */
const mapasFiltrados = computed(() => {
  const termino = inputBusqueda.value.trim().toLowerCase();
  let lista = mapasStore.maps.filter(esVisible);
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

watch(paginaActual, (p) => cargar(p));

onMounted(() => cargar(paginaActual.value));
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div class="flex">
          <!-- Selector Orden -->
          <div class="columna-8">
            <ClientOnly>
              <label for="selector-orden-mapas">Ordenar por</label>
              <select
                id="selector-orden-mapas"
                v-model="seleccionOrden"
                name="selector-orden-mapas"
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
                  <label for="idunicobusquedamapas"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusquedamapas"
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

        <div v-if="mapasStore.isLoading" class="flex flex-contenido-centrado m-t-3">
          <img
            class="color-invertir"
            :src="`${config.app.baseURL}img/loader.gif`"
            alt="...Cargando"
            height="120px"
          />
        </div>

        <div v-if="mapasFiltrados.length === 0 && !mapasStore.isLoading" class="flex">
          <div
            class="flex flex-contenido-centrado columna-16 borde-redondeado-16 m-2 fondo-color-informacion texto-color-informacion p-2"
          >
            <p class="nota texto-color-informacion m-2">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>
          </div>
        </div>
        <div v-if="mapasFiltrados.length !== 0 && !mapasStore.isLoading" class="flex">
          <div class="columna-16">
            <ClientOnly>
              <MapasTablaMapas :mapas="mapasFiltrados" />
              <UiPaginador
                :pagina-parent="paginaActual"
                :total-paginas="totalPags"
                @cambio="paginaActual = $event"
              />
            </ClientOnly>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
