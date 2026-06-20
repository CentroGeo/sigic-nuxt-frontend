<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  mapa: {
    type: Object,
    default: null,
  },
});

const modal = ref(null);
const tab = ref('enlace');
const ancho = ref(800);
const alto = ref(600);
const copiado = ref('');
const haciendoPublico = ref(false);

const mapasStore = useMapasStore();
const { capasNoPublicas, puedeSerPublico } = useMapaPublicable();
const { urlAbsoluta } = useUrlAbsoluta();

const urlVisualizar = computed(() =>
  urlAbsoluta(`/geocontenidos/mapas/${props.mapa?.id}/visualizar`)
);
const urlEmbed = computed(() => urlAbsoluta(`/geocontenidos/mapas/${props.mapa?.id}/embed`));

const snippetEmbed = computed(
  () =>
    `<iframe src="${urlEmbed.value}" width="${ancho.value}" height="${alto.value}" frameborder="0" allowfullscreen style="display:block;margin:0 auto;max-width:100%;border:0"></iframe>`
);

const esPublico = computed(() => props.mapa?.is_public !== false);

async function copiar(texto, clave) {
  try {
    await navigator.clipboard.writeText(texto);
    copiado.value = clave;
    setTimeout(() => {
      if (copiado.value === clave) copiado.value = '';
    }, 2000);
  } catch (e) {
    console.warn('[ModalCompartir] copy failed', e);
  }
}

async function hacerPublico() {
  if (!props.mapa?.id || !puedeSerPublico.value) return;
  haciendoPublico.value = true;
  await mapasStore.actualizarMapa(props.mapa.id, { is_public: true });
  haciendoPublico.value = false;
}

function abrir() {
  tab.value = 'enlace';
  copiado.value = '';
  modal.value?.abrirModal();
}

function cerrar() {
  modal.value?.cerrarModal();
}

defineExpose({ abrir, cerrar });
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h1 class="m-0">Compartir mapa</h1>
      </template>

      <template #cuerpo>
        <div v-if="!esPublico" class="aviso-privado m-b-2">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <div class="aviso-cuerpo">
            <div class="flex flex-contenido-separado">
              <span>
                Este mapa está marcado como privado. Nadie más podrá verlo con el enlace o embed.
              </span>
              <button
                type="button"
                class="boton-primario boton-chico"
                :disabled="haciendoPublico || !puedeSerPublico"
                @click="hacerPublico"
              >
                {{ haciendoPublico ? 'Guardando…' : 'Hacer público' }}
              </button>
            </div>
            <p v-if="!puedeSerPublico" class="m-0 m-t-1">
              No puede hacerse público: tiene {{ capasNoPublicas.length }}
              {{ capasNoPublicas.length === 1 ? 'capa no publicada' : 'capas no publicadas' }}
              en el catálogo. Publícalas primero.
            </p>
          </div>
        </div>

        <div class="tabs flex m-b-2">
          <button
            type="button"
            class="tab-boton"
            :class="{ activa: tab === 'enlace' }"
            @click="tab = 'enlace'"
          >
            <i class="fa-solid fa-link" aria-hidden="true"></i> Enlace
          </button>
          <button
            type="button"
            class="tab-boton"
            :class="{ activa: tab === 'embed' }"
            @click="tab = 'embed'"
          >
            <i class="fa-solid fa-code" aria-hidden="true"></i> Embed
          </button>
        </div>

        <div v-if="tab === 'enlace'" class="panel-tab">
          <label class="campo-etiqueta">Enlace público</label>
          <div class="flex campo-copia">
            <input :value="urlVisualizar" readonly type="text" class="entrada-copia" />
            <button
              type="button"
              class="boton-secundario boton-chico"
              @click="copiar(urlVisualizar, 'enlace')"
            >
              {{ copiado === 'enlace' ? '¡Copiado!' : 'Copiar' }}
            </button>
          </div>
          <p class="texto-secundario m-t-1">Cualquier persona con este enlace puede ver el mapa.</p>
        </div>

        <div v-else-if="tab === 'embed'" class="panel-tab">
          <div class="flex dimensiones">
            <label>
              <span class="campo-etiqueta">Ancho (px)</span>
              <input v-model.number="ancho" type="number" min="100" step="10" />
            </label>
            <label>
              <span class="campo-etiqueta">Alto (px)</span>
              <input v-model.number="alto" type="number" min="100" step="10" />
            </label>
          </div>

          <label class="campo-etiqueta m-t-2">Código embed</label>
          <textarea :value="snippetEmbed" readonly rows="4" class="textarea-copia" />
          <div class="flex flex-contenido-final m-t-1">
            <button
              type="button"
              class="boton-secundario boton-chico"
              @click="copiar(snippetEmbed, 'embed')"
            >
              {{ copiado === 'embed' ? '¡Copiado!' : 'Copiar código' }}
            </button>
          </div>
          <p class="texto-secundario m-t-1">Pegá este código en cualquier sitio web.</p>
        </div>
      </template>

      <template #pie>
        <div class="flex flex-contenido-final">
          <button class="boton-secundario" type="button" @click="cerrar">Cerrar</button>
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

.aviso-privado {
  padding: 8px 12px;
  border-radius: 6px;
  background-color: var(--color-secundario-2, #fff4d6);
  color: var(--color-primario-4, #604a00);
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.aviso-cuerpo {
  flex: 1;
  align-items: center;
  gap: 12px;
}

.tabs {
  gap: 0;
  border-bottom: 1px solid var(--color-neutro-1);
}

.tab-boton {
  color: var(--color-neutro-1);
  background: none;
  border: none;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &.activa {
    border-bottom-color: var(--color-primario, #ff51ba);
    font-weight: 600;
  }
}

.campo-etiqueta {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.campo-copia {
  align-items: center;
  gap: 8px;
}

.entrada-copia {
  flex: 1;
  font-family: monospace;
  padding: 6px 8px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 4px;
}

.textarea-copia {
  width: 100%;
  font-family: monospace;
  font-size: 0.85rem;
  padding: 8px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 4px;
  resize: vertical;
}

.dimensiones {
  gap: 12px;

  label {
    flex: 1;
  }

  input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--color-neutro-1);
    border-radius: 4px;
  }
}

.flex {
  gap: 8px;
}
</style>
