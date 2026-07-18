<script setup>
const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { fetchTopBar, actualizarTopBar } = useTableroApi();

const topBar = ref(null);
const cargando = ref(false);
const guardando = ref(false);
const mensajeGuardado = ref('');

// Formulario local (espejo del topBar del servidor)
const form = reactive({
  show: false,
  title: '',
  background_color: '#ffffff',
  text_color: '#333333',
  height: 60,
});

async function cargar() {
  cargando.value = true;
  try {
    const datos = await fetchTopBar(props.siteId);
    topBar.value = datos;
    Object.assign(form, {
      show: datos.show,
      title: datos.title || '',
      background_color: datos.background_color || '#ffffff',
      text_color: datos.text_color || '#333333',
      height: datos.height || 60,
    });
  } catch (e) {
    console.error('Error al cargar banda institucional:', e);
  } finally {
    cargando.value = false;
  }
}

async function guardar() {
  guardando.value = true;
  mensajeGuardado.value = '';
  try {
    const actualizado = await actualizarTopBar(
      props.siteId,
      { ...form },
      userData.value?.accessToken
    );
    if (actualizado?.id) {
      topBar.value = actualizado;
      mensajeGuardado.value = 'Cambios guardados.';
      setTimeout(() => {
        mensajeGuardado.value = '';
      }, 3000);
    }
  } catch (e) {
    console.error('Error al guardar banda institucional:', e);
  } finally {
    guardando.value = false;
  }
}

watch(() => props.siteId, cargar, { immediate: true });
</script>

<template>
  <div class="tab-banda">
    <div v-if="cargando"><GeocontenidosLoader mensaje="Cargando configuración..." /></div>

    <template v-else-if="topBar">
      <div class="tab-banda__seccion">
        <h3 class="tab-banda__titulo-seccion">Configuración de la banda</h3>

        <div class="tab-banda__campo">
          <label class="formulario-etiqueta" for="banda-show"> Mostrar banda institucional </label>
          <input id="banda-show" v-model="form.show" type="checkbox" />
        </div>

        <div class="tab-banda__campo">
          <label class="formulario-etiqueta" for="banda-title">Título (lado izquierdo)</label>
          <input
            id="banda-title"
            v-model="form.title"
            type="text"
            placeholder="Ej: Secretaría de Energía · CNE"
            :disabled="!form.show"
          />
        </div>

        <div class="tab-banda__fila">
          <div class="tab-banda__campo">
            <label class="formulario-etiqueta" for="banda-bg">Color de fondo</label>
            <div class="tab-banda__color-fila">
              <input
                id="banda-bg"
                v-model="form.background_color"
                type="color"
                :disabled="!form.show"
              />
              <input
                v-model="form.background_color"
                type="text"
                maxlength="7"
                placeholder="#ffffff"
                :disabled="!form.show"
              />
            </div>
          </div>

          <div class="tab-banda__campo">
            <label class="formulario-etiqueta" for="banda-text">Color de texto</label>
            <div class="tab-banda__color-fila">
              <input
                id="banda-text"
                v-model="form.text_color"
                type="color"
                :disabled="!form.show"
              />
              <input
                v-model="form.text_color"
                type="text"
                maxlength="7"
                placeholder="#333333"
                :disabled="!form.show"
              />
            </div>
          </div>

          <div class="tab-banda__campo">
            <label class="formulario-etiqueta" for="banda-height">Alto (px)</label>
            <input
              id="banda-height"
              v-model.number="form.height"
              type="number"
              min="32"
              max="120"
              :disabled="!form.show"
            />
          </div>
        </div>

        <!-- Preview -->
        <div
          class="tab-banda__preview"
          :style="{
            backgroundColor: form.background_color,
            color: form.text_color,
            height: `${form.height}px`,
          }"
        >
          <span v-if="form.title" class="tab-banda__preview-titulo">{{ form.title }}</span>
          <span v-else class="tab-banda__preview-placeholder">Vista previa de la banda</span>
          <div class="tab-banda__preview-logos">
            <template v-for="logo in topBar.logos || []" :key="logo.id">
              <img
                v-if="logo.icon || logo.icon_url"
                :src="logo.icon || logo.icon_url"
                :alt="logo.alt_text"
                style="max-height: 36px; width: auto; object-fit: contain"
              />
            </template>
          </div>
        </div>

        <div class="tab-banda__acciones">
          <button type="button" class="boton boton-primario" :disabled="guardando" @click="guardar">
            {{ guardando ? 'Guardando...' : 'Guardar configuración' }}
          </button>
          <span v-if="mensajeGuardado" class="tab-banda__mensaje-ok">{{ mensajeGuardado }}</span>
        </div>
      </div>

      <!-- Gestión de logos -->
      <div class="tab-banda__seccion">
        <TablerosAdminSubidorLogosTopBar :top-bar-id="props.siteId" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.tab-banda {
  padding: 1.5rem;

  &__titulo-seccion {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1.25rem;
  }

  &__seccion {
    background: var(--color-neutro-1, #f8f8f8);
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  &__campo {
    margin-bottom: 1rem;

    input[type='text'],
    input[type='url'],
    input[type='number'] {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
    }

    input[type='checkbox'] {
      margin-left: 0.5rem;
      width: auto;
    }
  }

  &__fila {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1rem;
    align-items: start;
  }

  &__color-fila {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;

    input[type='color'] {
      width: 40px;
      height: 36px;
      padding: 2px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }

    input[type='text'] {
      flex: 1;
    }
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    border: 1px dashed #ccc;
    transition:
      background-color 0.2s,
      color 0.2s,
      height 0.2s;
    overflow: hidden;
  }

  &__preview-titulo {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__preview-placeholder {
    font-size: 0.8rem;
    opacity: 0.5;
    font-style: italic;
  }

  &__preview-logos {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__acciones {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  &__mensaje-ok {
    color: var(--color-exito, #2e7d32);
    font-size: 0.875rem;
  }
}
</style>
