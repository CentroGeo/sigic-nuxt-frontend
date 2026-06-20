<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  existingLayerIds: { type: Array, default: () => [] },
  selectedLayerIds: { type: Array, default: () => [] },
});

const emit = defineEmits(['select-layer']);

const config = useRuntimeConfig();
const { data: session } = useAuth();
const api = config.public.geonodeApi;

const busqueda = ref('');
const pagina = ref(1);
const tamPagina = 10;
const categoriaSeleccionada = ref(null);

const categorias = ref([]);
const cargandoCategorias = ref(false);

const capas = ref([]);
const totalCapas = ref(0);
const cargandoCapas = ref(false);
const errorCapas = ref('');

const totalPaginas = computed(() =>
  totalCapas.value ? Math.ceil(totalCapas.value / tamPagina) : 0
);

function headers() {
  const token = session.value?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function cargarCategorias() {
  cargandoCategorias.value = true;
  try {
    const res = await fetch(`${api}/categories/?page_size=200`, { headers: headers() });
    if (!res.ok) throw new Error('error');
    const data = await res.json();
    categorias.value = data.categories || data.results || [];
    if (!categoriaSeleccionada.value && categorias.value.length) {
      categoriaSeleccionada.value = categorias.value[0];
    }
  } catch {
    categorias.value = [];
  } finally {
    cargandoCategorias.value = false;
  }
}

async function cargarCapas() {
  cargandoCapas.value = true;
  errorCapas.value = '';
  const params = new URLSearchParams({
    page: String(pagina.value),
    page_size: String(tamPagina),
  });
  // GeoNode no soporta el lookup `.in` con lista separada por comas;
  // hay que repetir el parámetro por cada valor.
  params.append('filter{subtype.in}', 'vector');
  params.append('filter{subtype.in}', 'raster');
  if (busqueda.value.trim()) {
    params.append('search', busqueda.value.trim());
  } else if (categoriaSeleccionada.value) {
    params.append('filter{category.identifier}', categoriaSeleccionada.value.identifier);
  }

  try {
    const res = await fetch(`${api}/datasets/?${params.toString()}`, { headers: headers() });
    if (!res.ok) throw new Error('error');
    const data = await res.json();
    capas.value = data.datasets || data.results || [];
    totalCapas.value = data.total ?? data.count ?? capas.value.length;
  } catch (e) {
    errorCapas.value = `No se pudo cargar el catálogo: ${e}`;
    capas.value = [];
    totalCapas.value = 0;
  } finally {
    cargandoCapas.value = false;
  }
}

function buscar() {
  categoriaSeleccionada.value = null;
  pagina.value = 1;
  cargarCapas();
}

function elegirCategoria(cat) {
  categoriaSeleccionada.value = cat;
  busqueda.value = '';
  pagina.value = 1;
  cargarCapas();
}

function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) {
    pagina.value += 1;
    cargarCapas();
  }
}

function paginaAnterior() {
  if (pagina.value > 1) {
    pagina.value -= 1;
    cargarCapas();
  }
}

function estaEnMapa(pk) {
  return props.existingLayerIds.includes(pk);
}

function estaSeleccionada(pk) {
  return props.selectedLayerIds.includes(pk);
}

function clickCapa(layer) {
  if (estaEnMapa(layer.pk)) return;
  emit('select-layer', layer);
}

function limpiarHtml(s) {
  if (!s) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = s;
  return tmp.textContent || tmp.innerText || '';
}

watch(categoriaSeleccionada, (n, o) => {
  if (n?.id !== o?.id && !busqueda.value) cargarCapas();
});

onMounted(async () => {
  await cargarCategorias();
  cargarCapas();
});
</script>

<template>
  <div class="buscador-capas">
    <div class="barra-busqueda flex m-b-2">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar capas por nombre…"
        class="buscador-input"
        @keyup.enter="buscar"
      />
      <button class="boton-primario" type="button" @click="buscar">Buscar</button>
    </div>

    <div class="dos-columnas">
      <div class="col-categorias">
        <h4 class="titulo-col">Categorías</h4>
        <div class="caja-categorias">
          <p v-if="cargandoCategorias" class="texto-secundario p-1">Cargando…</p>
          <ul v-else-if="categorias.length" class="lista-categorias">
            <li
              v-for="cat in categorias"
              :key="cat.id"
              class="item-categoria"
              :class="{ activa: categoriaSeleccionada?.id === cat.id }"
              @click="elegirCategoria(cat)"
            >
              <span class="cat-nombre">
                {{ cat.gn_description || cat.description || cat.identifier }}
              </span>
              <span class="cat-contador">{{ cat.count ?? 0 }}</span>
            </li>
          </ul>
          <p v-else class="texto-secundario p-1">Sin categorías.</p>
        </div>
      </div>

      <div class="col-capas">
        <h4 class="titulo-col">
          Capas
          <span v-if="totalCapas" class="texto-secundario">({{ totalCapas }})</span>
        </h4>
        <div class="caja-capas">
          <p v-if="cargandoCapas" class="texto-secundario p-1">Buscando…</p>
          <p v-else-if="errorCapas" class="texto-error p-1">{{ errorCapas }}</p>
          <p v-else-if="!capas.length" class="texto-secundario p-1">Sin resultados.</p>
          <ul v-else class="lista-capas">
            <li
              v-for="capa in capas"
              :key="capa.pk"
              class="item-capa"
              :class="{
                'en-mapa': estaEnMapa(capa.pk),
                seleccionada: estaSeleccionada(capa.pk),
              }"
              @click="clickCapa(capa)"
            >
              <div class="capa-thumb">
                <img v-if="capa.thumbnail_url" :src="capa.thumbnail_url" :alt="capa.title" />
                <span v-else class="pictograma-imagen" aria-hidden="true" />
              </div>
              <div class="capa-info">
                <div class="capa-titulo-fila flex flex-contenido-separado">
                  <strong>{{ capa.title || capa.alternate }}</strong>
                  <span v-if="estaEnMapa(capa.pk)" class="etiqueta etiqueta-ok">Agregada</span>
                  <span v-else-if="estaSeleccionada(capa.pk)" class="etiqueta etiqueta-sel"
                    >Seleccionada</span
                  >
                </div>
                <p class="capa-descripcion texto-secundario m-0">
                  {{ limpiarHtml(capa.abstract) || 'Sin descripción.' }}
                </p>
                <div class="capa-meta flex">
                  <span class="etiqueta">{{ capa.subtype }}</span>
                  <span
                    class="etiqueta"
                    :class="capa.is_published ? 'etiqueta-publica' : 'etiqueta-privada'"
                  >
                    {{ capa.is_published ? 'Pública' : 'Privada' }}
                  </span>
                  <span class="texto-secundario">{{ capa.workspace }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="totalPaginas > 1" class="paginacion flex flex-contenido-separado m-t-1">
          <button
            class="boton-secundario boton-chico"
            type="button"
            :disabled="pagina === 1"
            @click="paginaAnterior"
          >
            Anterior
          </button>
          <span class="texto-secundario">Página {{ pagina }} de {{ totalPaginas }}</span>
          <button
            class="boton-secundario boton-chico"
            type="button"
            :disabled="pagina === totalPaginas"
            @click="paginaSiguiente"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.buscador-capas {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.barra-busqueda {
  gap: 8px;
}

.buscador-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 6px;
}

.dos-columnas {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 2fr;
  gap: 12px;
}

.titulo-col {
  margin: 0 0 6px 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--color-neutro-3);
}

.caja-categorias,
.caja-capas {
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  max-height: 37vh;
  overflow-y: auto;
  background-color: var(--fondo);
}

.lista-categorias {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-categoria {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-left: 3px solid transparent;
  border-bottom: 1px solid var(--color-neutro-1);
  font-size: 0.85rem;
}

.item-categoria:hover {
  background-color: var(--fondo-acento);
}

.item-categoria.activa {
  border-left-color: var(--color-primario-4);
  background-color: var(--fondo-acento);
}

.cat-nombre {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-contador {
  background-color: var(--color-neutro-3);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 6px;
}

.lista-capas {
  list-style: none;
  padding: 8px;
  margin: 0;
}

.item-capa {
  display: flex;
  gap: 10px;
  padding: 8px;
  border: 2px solid var(--color-neutro-1);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.item-capa:hover {
  border-color: var(--color-primario-4);
  background-color: var(--fondo-acento);
}

.item-capa.en-mapa {
  opacity: 0.6;
  cursor: not-allowed;
}

.item-capa.seleccionada {
  border-color: var(--color-primario-4);
  background-color: var(--fondo-acento);
}

.capa-thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--color-neutro-1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capa-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capa-info {
  flex: 1;
  min-width: 0;
}

.capa-descripcion {
  font-size: 0.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 4px 0;
}

.capa-meta {
  gap: 8px;
  font-size: 0.75rem;
  align-items: center;
}

.etiqueta {
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
}

.etiqueta-ok {
  background-color: #d8f5dc;
  color: #16703c;
}

.etiqueta-publica {
  background-color: #d8f5dc;
  color: #16703c;
}

.etiqueta-privada {
  background-color: #fde2e1;
  color: #c0392b;
}

.etiqueta-sel {
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
}

.texto-error {
  color: var(--color-error, #c0392b);
}

.flex {
  gap: 8px;
}
</style>
