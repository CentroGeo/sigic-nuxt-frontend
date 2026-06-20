<script setup>
import useFocusTrap from '@centrogeomx/sisdai-componentes/src/composables/useFocusTrap.js';

const eventos = defineEmits(['alAbrir', 'alCerrar']);
const props = defineProps({
  /**
   * Define si se puede cerrar el modal o debe persistir
   * @param {boolean}
   */
  permitirCerrar: {
    type: Boolean,
    default: true,
  },
  tamanioModal: {
    type: String,
    default: '',
  },
});

const { permitirCerrar, tamanioModal } = toRefs(props);
const id_aleatorio = 'modal-' + Math.random().toString(36).substring(2);
const { trapRef } = useFocusTrap();
const abierto = ref(false);

/**
 * Abre el modal y agregar la clase overflow-hidden al body
 */
function abrir() {
  abierto.value = true;
  document.querySelector('body').classList.add('overflow-hidden');
  trapRef.value.showModal();
  eventos('alAbrir');
}

/**
 * Cierra el modal y remover la clase overflow-hidden del body
 */
function cerrar() {
  abierto.value = false;
  document.querySelector('body').classList.remove('overflow-hidden');
  trapRef.value.close();
  eventos('alCerrar');
}

/**
 * Revisa si la tecla Esc fue presionada para cerrar el modal
 * @param event
 */
function revisarTecla(event) {
  if (abierto.value && event.which === 27) {
    cerrar();

    if (!permitirCerrar.value) {
      abrir();
    }
  }
}

/**
 * Revisa si se da click fuera del modal o en el :backdrop
 * mientras esté abierto para cerrarlo
 * @param {Object} event
 */
function revisarClick({ target }) {
  if (abierto.value && permitirCerrar.value && target === trapRef.value) {
    cerrar();
  }
}

onBeforeMount(() => {
  window.addEventListener('keyup', revisarTecla);
  window.addEventListener('click', revisarClick);
});
onBeforeUnmount(() => {
  window.removeEventListener('keyup', revisarTecla);
  window.addEventListener('click', revisarClick);
});

defineExpose({
  abrir,
  cerrar,
  abierto,
});
</script>

<template>
  <dialog
    :id="id_aleatorio"
    ref="trapRef"
    class="modal"
    :class="tamanioModal"
    aria-labelledby="titulo_modal"
  >
    <div class="modal-contenedor">
      <div class="modal-cabecera">
        <slot name="encabezado">
          <h1 class="m-t-0">Título del modal</h1>
        </slot>
      </div>

      <div class="modal-cuerpo">
        <slot><p>Contenido del modal.</p></slot>
      </div>

      <div class="modal-pie">
        <slot name="pie" />
      </div>

      <button
        type="button"
        role="button"
        class="boton-pictograma boton-sin-contenedor-secundario modal-cerrar"
        aria-label="Cerrar"
        :disabled="!permitirCerrar"
        @click="cerrar"
      >
        <span class="pictograma-cerrar" aria-hidden="true" />
      </button>
    </div>
  </dialog>
</template>
