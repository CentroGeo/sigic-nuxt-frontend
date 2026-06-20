<script setup>
const emit = defineEmits(['cerrar']);

defineProps({
  ancho: { type: String, default: '900px' },
});

const dialogRef = ref(null);

function abrir() {
  document.body.classList.add('overflow-hidden');
  dialogRef.value?.showModal();
}

function cerrar() {
  document.body.classList.remove('overflow-hidden');
  dialogRef.value?.close();
  emit('cerrar');
}

onMounted(() => {
  // Escape nativo: prevenimos el cierre automático del <dialog> y emitimos nosotros
  dialogRef.value?.addEventListener('cancel', (e) => {
    e.preventDefault();
    cerrar();
  });
});

defineExpose({ abrir, cerrar });
</script>

<template>
  <dialog ref="dialogRef" class="modal-base" :style="`--modal-ancho: ${ancho}`">
    <div class="modal-base__contenedor">
      <div class="modal-base__cabecera">
        <slot name="encabezado" />
        <button type="button" class="modal-base__btn-cerrar" aria-label="Cerrar" @click="cerrar">
          <span class="pictograma-cerrar" aria-hidden="true" />
        </button>
      </div>

      <div class="modal-base__cuerpo">
        <slot name="cuerpo" />
      </div>
    </div>
  </dialog>
</template>

<style lang="scss" scoped>
.modal-base {
  --modal-ancho: 900px;
  width: min(var(--modal-ancho), 96vw);
  max-height: 90vh;
  padding: 0;
  border: none;
  border-radius: 10px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  background: var(--color-fondo-1, #fff);

  &::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }

  &__contenedor {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  &__cabecera {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--color-fondo-1, #fff);
    border-bottom: 2px solid var(--color-primario-4, #991f47);

    :deep(h2),
    :deep(h3) {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-primario-4, #991f47);
    }
  }

  &__btn-cerrar {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-texto-secundario, #666);
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-secundario-3, #f8e1e8);
      color: var(--color-primario-4, #991f47);
    }

    .pictograma-cerrar {
      font-size: 1.1rem;
    }
  }

  &__cuerpo {
    overflow-y: auto;
    padding: 1.5rem;
    flex: 1;
  }
}
</style>
