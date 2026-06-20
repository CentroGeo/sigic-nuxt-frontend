<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  mapa: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['actualizado']);

const mapasStore = useMapasStore();
const { capasNoPublicas, puedeSerPublico } = useMapaPublicable();
const modal = ref(null);
const guardando = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  zoom: 5,
  center_lat: -101.61,
  center_long: 22.21,
  base_layer: 'osm',
  map_type: 'regular',
  highlight_color: '#ff51ba',
  is_public: true,
});

function cargarFormulario() {
  if (!props.mapa) return;
  form.name = props.mapa.name ?? '';
  form.zoom = props.mapa.zoom ?? 5;
  form.center_lat = props.mapa.center_lat ?? -101.61;
  form.center_long = props.mapa.center_long ?? 22.21;
  form.base_layer = props.mapa.base_layer ?? 'osm';
  form.map_type = props.mapa.map_type ?? 'regular';
  form.highlight_color = props.mapa.highlight_color ?? '#ff51ba';
  form.is_public = props.mapa.is_public ?? true;
  // Una capa sin publicar impide que el mapa sea público.
  if (!puedeSerPublico.value) form.is_public = false;
}

watch(() => props.mapa, cargarFormulario, { immediate: true });

// Si el mapa deja de poder ser público (capas sin publicar), forzar privado.
watch(puedeSerPublico, (ok) => {
  if (!ok) form.is_public = false;
});

function abrir() {
  cargarFormulario();
  error.value = '';
  modal.value?.abrirModal();
}

function cerrar() {
  modal.value?.cerrarModal();
}

async function guardar() {
  if (!props.mapa?.id) {
    error.value = 'Mapa no disponible.';
    return;
  }
  if (!form.name.trim()) {
    error.value = 'El nombre es obligatorio.';
    return;
  }
  if (form.is_public && !puedeSerPublico.value) {
    error.value = 'El mapa no puede ser público mientras tenga capas no publicadas en el catálogo.';
    return;
  }
  guardando.value = true;
  error.value = '';
  const payload = {
    name: form.name.trim(),
    zoom: Number(form.zoom),
    center_lat: Number(form.center_lat),
    center_long: Number(form.center_long),
    base_layer: form.base_layer,
    map_type: form.map_type,
    highlight_color: form.highlight_color,
    is_public: Boolean(form.is_public),
  };
  const data = await mapasStore.actualizarMapa(props.mapa.id, payload);
  guardando.value = false;
  if (!data) {
    error.value = 'No se pudo actualizar el mapa.';
    return;
  }
  emit('actualizado', data);
  cerrar();
}

defineExpose({ abrir, cerrar });
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h1 class="m-0">Editar mapa</h1>
      </template>

      <template #cuerpo>
        <SisdaiCampoBase
          v-model="form.name"
          etiqueta="Nombre*"
          tipo="text"
          :es_etiqueta_visible="true"
        />

        <div class="m-t-2">
          <SisdaiSelector v-model="form.map_type" etiqueta="Tipo de mapa">
            <option value="regular">Regular</option>
            <option value="swipe">Swipe</option>
            <option value="dual">Dual</option>
          </SisdaiSelector>
        </div>

        <div class="m-t-2">
          <SisdaiSelector v-model="form.base_layer" etiqueta="Capa base">
            <option value="osm">OpenStreetMap</option>
            <option value="carto">Carto Light</option>
            <option value="carto_dark">Carto Dark</option>
            <option value="satellite">Satélite</option>
          </SisdaiSelector>
        </div>

        <div class="m-t-2">
          <label class="campo-color">
            <span class="campo-etiqueta">Color de resaltado</span>
            <input v-model="form.highlight_color" type="color" />
            <span class="texto-secundario">{{ form.highlight_color }}</span>
          </label>
        </div>

        <div class="m-t-2">
          <label class="campo-toggle">
            <input v-model="form.is_public" type="checkbox" :disabled="!puedeSerPublico" />
            <span class="campo-etiqueta boton-secundario boton-chico">
              {{ form.is_public ? 'Mapa público' : 'Mapa privado' }}
            </span>
          </label>
          <p class="texto-secundario m-0">
            {{
              form.is_public
                ? 'Cualquier persona con el enlace puede ver el mapa.'
                : 'Sólo tú puedes ver el mapa.'
            }}
          </p>
          <p v-if="!puedeSerPublico" class="texto-error m-t-1 m-b-0">
            Este mapa tiene {{ capasNoPublicas.length }}
            {{ capasNoPublicas.length === 1 ? 'capa no publicada' : 'capas no publicadas' }}
            en el catálogo. Para hacerlo público, todas sus capas deben estar publicadas.
          </p>
        </div>

        <p v-if="error" class="m-t-2 texto-error">{{ error }}</p>
      </template>

      <template #pie>
        <div class="flex flex-contenido-final">
          <button class="boton-secundario" type="button" @click="cerrar">Cancelar</button>
          <button class="boton-primario" type="button" :disabled="guardando" @click="guardar">
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </button>
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

.campo-color {
  display: flex;
  align-items: center;
  gap: 12px;
}

.campo-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.campo-etiqueta {
  font-weight: 600;
}

.texto-error {
  color: var(--color-error, #c0392b);
}

.flex {
  gap: 8px;
}
</style>
