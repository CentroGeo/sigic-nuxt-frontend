<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  mapaId: { type: Number, required: true },
  mapType: { type: String, default: 'regular' },
});

const mapasStore = useMapasStore();
const modal = ref(null);

const seleccionadas = ref([]);
const guardando = ref(false);
const error = ref('');
const posicionDefecto = ref('left');

const tieneLados = computed(() => props.mapType === 'swipe' || props.mapType === 'dual');

const capasExistentes = computed(() => [...mapasStore.layersOrdered].reverse());

const idsExistentes = computed(() =>
  capasExistentes.value.map((l) => l.geonode_id).filter((v) => v !== null)
);
const idsSeleccionadas = computed(() => seleccionadas.value.map((l) => l.pk));

function alSeleccionarCapa(layer) {
  if (idsExistentes.value.includes(layer.pk)) return;
  const i = seleccionadas.value.findIndex((l) => l.pk === layer.pk);
  if (i >= 0) seleccionadas.value.splice(i, 1);
  else seleccionadas.value.push(layer);
}

function removerSeleccionada(pk) {
  seleccionadas.value = seleccionadas.value.filter((l) => l.pk !== pk);
}

async function eliminarExistente(capa) {
  if (!confirm(`¿Eliminar la capa "${capa.name}" del mapa?`)) return;
  await mapasStore.eliminarCapa(capa.id);
}

async function actualizarEstilo({ layerId, style }) {
  await mapasStore.actualizarEstiloCapa(layerId, style);
}

async function alternarVisible(capa) {
  await mapasStore.actualizarCapa(capa.id, { visible: !capa.visible });
}

async function moverArriba(idx) {
  if (idx === 0) return;
  const ord = capasExistentes.value;
  const a = ord[idx];
  const b = ord[idx - 1];
  await mapasStore.reordenarCapas([
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

async function moverAbajo(idx) {
  const ord = capasExistentes.value;
  if (idx === ord.length - 1) return;
  const a = ord[idx];
  const b = ord[idx + 1];
  await mapasStore.reordenarCapas([
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

function cerrar() {
  mapasStore.cerrarModalAgregarCapas();
}

async function guardar() {
  if (!seleccionadas.value.length) {
    cerrar();
    return;
  }
  guardando.value = true;
  error.value = '';
  const base = capasExistentes.value.length;
  const payload = seleccionadas.value.map((l, i) => ({
    geonode_id: l.pk,
    visible: true,
    opacity: 1.0,
    map_position: tieneLados.value ? posicionDefecto.value : 'left',
    stack_order: base + i,
  }));
  const data = await mapasStore.agregarCapas(props.mapaId, payload);
  guardando.value = false;
  if (!data) {
    error.value = 'No se pudieron agregar las capas.';
    return;
  }
  seleccionadas.value = [];
  cerrar();
}

let dialogEl = null;

function sincronizarCierre() {
  mapasStore.cerrarModalAgregarCapas();
}

watch(
  () => mapasStore.modalAgregarCapasAbierto,
  async (abierto) => {
    if (abierto) {
      seleccionadas.value = [];
      error.value = '';
      posicionDefecto.value = 'left';
      await nextTick();
      modal.value?.abrirModal();
      const id = modal.value?.id_aleatorio;
      if (id) {
        dialogEl = document.getElementById(id);
        dialogEl?.addEventListener('close', sincronizarCierre);
      }
    } else {
      dialogEl?.removeEventListener('close', sincronizarCierre);
      modal.value?.cerrarModal();
      dialogEl = null;
    }
  }
);

onBeforeUnmount(() => {
  dialogEl?.removeEventListener('close', sincronizarCierre);
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" tamanio-modal="modal-grande">
      <template #encabezado>
        <h1 class="m-0">Agregar capas</h1>
      </template>

      <template #cuerpo>
        <div v-if="tieneLados" class="m-b-2">
          <SisdaiSelector v-model="posicionDefecto" etiqueta="Asignar capas al panel">
            <option value="left">Izquierdo</option>
            <option value="right">Derecho</option>
          </SisdaiSelector>
        </div>

        <div class="dos-columnas">
          <section class="col-buscador">
            <h2 class="seccion-titulo">Buscar y agregar capas</h2>
            <MapasBuscadorCapas
              :existing-layer-ids="idsExistentes"
              :selected-layer-ids="idsSeleccionadas"
              @select-layer="alSeleccionarCapa"
            />
          </section>

          <section class="col-panel">
            <div class="bloque">
              <h2 class="seccion-titulo">
                Capas en el mapa
                <span class="texto-secundario">({{ capasExistentes.length }})</span>
              </h2>
              <div class="caja-existentes">
                <p v-if="!capasExistentes.length" class="texto-secundario p-1">
                  Este mapa aún no tiene capas.
                </p>
                <ul v-else class="lista-bloques">
                  <li
                    v-for="(capa, idx) in capasExistentes"
                    :key="capa.id"
                    class="item-bloque existente"
                  >
                    <div class="bloque-cabecera flex flex-contenido-separado">
                      <label class="capa-toggle flex">
                        <input
                          type="checkbox"
                          :checked="capa.visible"
                          @change="alternarVisible(capa)"
                        />
                        <strong>{{ capa.name }}</strong>
                      </label>
                      <span
                        v-if="capa.dataset_is_published != null"
                        class="etiqueta-visibilidad"
                        :class="capa.dataset_is_published ? 'es-publica' : 'es-privada'"
                      >
                        {{ capa.dataset_is_published ? 'Pública' : 'Privada' }}
                      </span>
                      <button
                        class="boton-pictograma boton-sin-contenedor-secundario"
                        type="button"
                        aria-label="Eliminar capa"
                        @click="eliminarExistente(capa)"
                      >
                        <span class="pictograma-tache" aria-hidden="true" />
                      </button>
                    </div>
                    <p class="texto-secundario m-0">
                      GeoNode ID: {{ capa.geonode_id ?? '—' }} · Opacidad:
                      {{ Math.round((capa.opacity ?? 1) * 100) }}%
                    </p>
                    <MapasSelectorEstiloCapa :capa="capa" @update:style="actualizarEstilo" />
                    <div class="acciones flex flex-contenido-final m-t-1">
                      <button
                        class="boton-pictograma boton-sin-contenedor-secundario"
                        :disabled="idx === 0"
                        type="button"
                        aria-label="Subir capa"
                        @click="moverArriba(idx)"
                      >
                        <span class="pictograma-angulo-arriba" aria-hidden="true" />
                      </button>
                      <button
                        class="boton-pictograma boton-sin-contenedor-secundario"
                        :disabled="idx === capasExistentes.length - 1"
                        type="button"
                        aria-label="Bajar capa"
                        @click="moverAbajo(idx)"
                      >
                        <span class="pictograma-angulo-abajo" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="bloque">
              <h2 class="seccion-titulo">
                Por agregar
                <span class="texto-secundario">({{ seleccionadas.length }})</span>
              </h2>
              <div class="caja-pendientes">
                <p v-if="!seleccionadas.length" class="texto-secundario p-1">
                  Selecciona capas en la columna izquierda.
                </p>
                <ul v-else class="lista-bloques">
                  <li v-for="capa in seleccionadas" :key="capa.pk" class="item-bloque pendiente">
                    <div class="bloque-cabecera flex flex-contenido-separado">
                      <div class="min-w-0">
                        <strong>{{ capa.title || capa.alternate }}</strong>
                        <p class="texto-secundario m-0">{{ capa.alternate }}</p>
                      </div>
                      <button
                        class="boton-pictograma boton-sin-contenedor-secundario"
                        type="button"
                        aria-label="Quitar"
                        @click="removerSeleccionada(capa.pk)"
                      >
                        <span class="pictograma-tache" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <p v-if="error" class="texto-error m-t-2">{{ error }}</p>
      </template>

      <template #pie>
        <div class="flex flex-contenido-separado">
          <span class="texto-secundario">
            <strong>{{ capasExistentes.length }}</strong> en el mapa ·
            <strong>{{ seleccionadas.length }}</strong> por agregar
          </span>
          <div class="flex flex-contenido-final">
            <button class="boton-secundario" type="button" @click="cerrar">Cerrar</button>
            <button
              class="boton-primario"
              type="button"
              :disabled="guardando || !seleccionadas.length"
              @click="guardar"
            >
              {{
                guardando
                  ? 'Guardando…'
                  : `Agregar ${seleccionadas.length} ${
                      seleccionadas.length === 1 ? 'capa' : 'capas'
                    }`
              }}
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.modal {
  border: 2px solid var(--color-secundario-2);
}

.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.8);
}

.dos-columnas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.seccion-titulo {
  font-size: 1rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.col-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.caja-existentes,
.caja-pendientes {
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  padding: 8px;
  max-height: 30vh;
  overflow-y: auto;
  background-color: var(--fondo);
}

.lista-bloques {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-bloque {
  border: 1px solid var(--color-neutro-1);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  background-color: var(--fondo-acento);
}

.item-bloque.existente {
  border-left: 3px solid #16703c;
}

.item-bloque.pendiente {
  border-left: 3px solid var(--color-primario-4);
}

.bloque-cabecera {
  align-items: flex-start;
}

.etiqueta-visibilidad {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  white-space: nowrap;
}

.etiqueta-visibilidad.es-publica {
  background-color: #d8f5dc;
  color: #16703c;
}

.etiqueta-visibilidad.es-privada {
  background-color: #fde2e1;
  color: #c0392b;
}

.capa-toggle {
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.min-w-0 {
  min-width: 0;
  flex: 1;
}

.acciones {
  gap: 4px;
}

.texto-error {
  color: var(--color-error, #c0392b);
}

.flex {
  gap: 8px;
}

@media (max-width: 900px) {
  .dos-columnas {
    grid-template-columns: 1fr;
  }
}

// Overrides del modal sisdai (solo para este modal). El dialog no teletransporta,
// por lo que :deep alcanza .modal / .modal-cuerpo / .modal-pie.
// Sube el modal (menos margen superior, aprovecha el espacio de arriba) y acota
// el cuerpo para que el modal completo entre en pantalla.
:deep(.modal) {
  margin-top: -20rem !important;
  margin-bottom: 2vh !important;
}

:deep(.modal-cuerpo) {
  max-height: calc(76vh - 120px) !important;
}

:deep(.modal-pie) {
  margin-top: 20px !important;
}
</style>
