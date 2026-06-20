<script setup>
const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();
const { esAdmin, cargarEsAdmin } = useEsAdmin();

const mapaId = computed(() => Number(route.params.id));

const esOwner = computed(() => {
  const ownerUsername = mapasStore.activeMap?.owner?.username;
  const sessionEmail = session.value?.user?.email;
  const sessionName = session.value?.user?.name;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === sessionEmail || ownerUsername === sessionName;
});

// Un mapa público solo es editable por su dueño o por un administrador.
const puedeEditar = computed(() => esAdmin.value || esOwner.value);

const modalEditar = ref(null);
const modalCompartir = ref(null);
function abrirCompartir() {
  modalCompartir.value?.abrir();
}

// Edición de capas en línea (en vez de navegar a /editar).
const editandoCapas = ref(false);
function alternarEdicionCapas() {
  editandoCapas.value = !editandoCapas.value;
}

function abrirEditar() {
  modalEditar.value?.abrir();
}

async function alternarVisible({ id, visible }) {
  await mapasStore.actualizarCapa(id, { visible });
}

async function cambiarOpacidad({ id, opacity }) {
  await mapasStore.actualizarCapa(id, { opacity });
}

async function reordenar(orden) {
  await mapasStore.reordenarCapas(orden);
}

function abrirAgregarCapas() {
  mapasStore.abrirModalAgregarCapas();
}

async function eliminarCapa(id) {
  await mapasStore.eliminarCapa(id);
}

async function eliminarMapa() {
  if (!confirm('¿Eliminar este mapa? Esta acción no se puede deshacer.')) return;
  const ok = await mapasStore.eliminarMapa(mapaId.value);
  if (ok) navigateTo('/geocontenidos/mapas');
}

function cambiarVista(vista) {
  if (!mapasStore.activeMap) return;
  mapasStore.activeMap = { ...mapasStore.activeMap, ...vista };
}

async function guardarVista(vista) {
  if (!mapasStore.activeMap) return;
  await mapasStore.actualizarMapa(mapasStore.activeMap.id, vista);
}

onMounted(async () => {
  await Promise.all([mapasStore.cargarMapa(mapaId.value), cargarEsAdmin()]);
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <div class="visor-pagina">
    <p v-if="mapasStore.isLoadingMap" class="m-3">Cargando mapa…</p>

    <div v-else-if="!mapasStore.activeMap" class="m-3">
      <p>No se encontró el mapa solicitado.</p>
      <NuxtLink to="/geocontenidos/mapas" class="boton-secundario">Volver al listado</NuxtLink>
    </div>

    <template v-else>
      <header class="encabezado-mapa flex flex-contenido-separado p-x-3 p-y-2">
        <div>
          <h1 class="m-0">{{ mapasStore.activeMap.name }}</h1>
          <p class="texto-secundario m-0">
            Por {{ mapasStore.activeMap.owner?.username || 'Anónimo' }} · Tipo:
            {{ mapasStore.activeMap.map_type }}
          </p>
        </div>
        <div class="flex">
          <NuxtLink
            :to="`/geocontenidos/mapas/${mapaId}/visualizar`"
            class="boton-secundario"
            target="_blank"
          >
            <i class="fa-solid fa-arrow-up-right-from-square"></i>&nbsp;Visualizar
          </NuxtLink>
          <button class="boton-secundario" type="button" @click="abrirCompartir">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>&nbsp;Compartir
          </button>
          <button v-if="puedeEditar" class="boton-primario" type="button" @click="abrirEditar">
            <span class="pictograma-mas" aria-hidden="true" /> Propiedades del Mapa
          </button>
          <button
            v-if="puedeEditar"
            class="boton-secundario"
            :class="{ 'boton-primario': editandoCapas }"
            type="button"
            :aria-pressed="editandoCapas"
            @click="alternarEdicionCapas"
          >
            <span class="pictograma-editar" aria-hidden="true" />
            &nbsp;{{ editandoCapas ? 'Cerrar Edición' : 'Editar Capas' }}
          </button>
          <NuxtLink to="/geocontenidos/mapas" class="boton-secundario">Lista de Mapas</NuxtLink>
          <button class="boton-secundario boton-eliminar" type="button" @click="eliminarMapa">
            <span class="pictograma-tache" aria-hidden="true" /> Eliminar mapa
          </button>
        </div>
      </header>

      <div class="contenido-visor flex">
        <div :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
          <MapasVisorMapa
            v-if="mapasStore.activeMap.map_type === 'regular'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
          <MapasVisorSwipe
            v-else-if="mapasStore.activeMap.map_type === 'swipe'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
          <MapasVisorDual
            v-else-if="mapasStore.activeMap.map_type === 'dual'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
        </div>

        <MapasPanelCapas
          :capas="mapasStore.activeLayers"
          :editable="editandoCapas"
          :mapa="mapasStore.activeMap"
          @toggle="alternarVisible"
          @opacidad="cambiarOpacidad"
          @reordenar="reordenar"
          @eliminar="eliminarCapa"
          @agregar="abrirAgregarCapas"
          @vista="cambiarVista"
          @guardar-vista="guardarVista"
        />
      </div>

      <MapasModalEditarMapa ref="modalEditar" :mapa="mapasStore.activeMap" />
      <MapasModalCompartir ref="modalCompartir" :mapa="mapasStore.activeMap" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
a {
  display: inline-flex !important;
  padding: 16px 24px !important;
  align-items: center !important;
}
.encabezado-mapa {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenido-visor {
  gap: 0;
  height: calc(88.5vh);
  overflow-y: scroll;
}

.contenedor-mapa {
  flex: 1;
  min-width: 600px;
  padding: 5px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 10px;
  border: 3px solid #e5c743;
  /* Alto definido: el visor (.visor-mapa) usa height:100% y lo llena.
     --altura-visor lo hereda el divisor del swipe. Ajustable. */
  height: 47rem;
  --altura-visor: 47rem;
}

.boton-eliminar {
  background-color: rgb(136, 0, 0);
}

.boton-eliminar:hover {
  background-color: rgb(191, 46, 46);
}

.flex {
  gap: 8px;
  flex-wrap: wrap;
}
</style>
