<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const emit = defineEmits(['creado']);

const mapasStore = useMapasStore();
const modal = ref(null);
const guardando = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  map_type: 'regular',
  highlight_color: '#ff51ba',
});

function abrir() {
  form.name = '';
  form.map_type = 'regular';
  form.highlight_color = '#ff51ba';
  error.value = '';
  modal.value?.abrirModal();
}

function cerrar() {
  modal.value?.cerrarModal();
}

async function guardar() {
  if (!form.name.trim()) {
    error.value = 'El nombre es obligatorio.';
    return;
  }
  guardando.value = true;
  error.value = '';
  const data = await mapasStore.crearMapa({
    name: form.name.trim(),
    map_type: form.map_type,
    highlight_color: form.highlight_color,
  });
  guardando.value = false;
  if (!data) {
    error.value = 'No se pudo crear el mapa. Verifica tu sesión.';
    return;
  }
  emit('creado', data);
  cerrar();
}

defineExpose({ abrir, cerrar });
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h1 class="m-0">Crear mapa</h1>
      </template>

      <template #cuerpo>
        <SisdaiCampoBase
          v-model="form.name"
          etiqueta="Nombre*"
          ejemplo="Mi mapa"
          tipo="text"
          :es_etiqueta_visible="true"
        />

        <div class="m-t-2">
          <SisdaiSelector v-model="form.map_type" etiqueta="Tipo de mapa*">
            <option value="regular">Regular — capas apiladas</option>
            <option value="swipe">Swipe — comparativo deslizante</option>
            <option value="dual">Dual — dos mapas sincronizados</option>
          </SisdaiSelector>
        </div>

        <div class="m-t-2">
          <label class="campo-color">
            <span class="campo-etiqueta">Color de resaltado</span>
            <input v-model="form.highlight_color" type="color" />
            <span class="texto-secundario">{{ form.highlight_color }}</span>
          </label>
        </div>

        <p v-if="error" class="m-t-2 texto-error">{{ error }}</p>
      </template>

      <template #pie>
        <div class="flex flex-contenido-final">
          <button class="boton-secundario" type="button" @click="cerrar">Cancelar</button>
          <button class="boton-primario" type="button" :disabled="guardando" @click="guardar">
            {{ guardando ? 'Creando…' : 'Crear' }}
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

// Fondo (backdrop) más oscuro solo para este modal. El <dialog> hereda el
// scope-id del componente, por lo que la regla aplica únicamente aquí.
.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.8);
}

.campo-color {
  display: flex;
  align-items: center;
  gap: 12px;
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
