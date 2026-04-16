<script setup>
const props = defineProps({
  cargando: {
    type: Boolean,
    default: true,
  },
  mensaje: {
    type: String,
    default: '',
  },
  permitirCerrar: {
    type: Boolean,
    default: true,
  },
  pictograma: {
    type: String,
    default: 'aprobado',
  },
  titulo: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
});
const { visible } = toRefs(props);

watch(visible, (nv) => {
  if (modal.value === null) return;

  if (nv) {
    modal.value.abrir();
  } else {
    modal.value.cerrar();
  }
});

function iniciar() {
  if (visible.value) {
    modal.value?.abrir();
  }
}

const modal = ref(null);
watch(modal, iniciar);
</script>

<template>
  <ClientOnly>
    <GeocontenidosSisdaiModal
      ref="modal"
      class="geocontenidos-modal"
      :permitir-cerrar="permitirCerrar"
    >
      <template #encabezado>
        <h1 class="m-1">{{ titulo }}</h1>
      </template>

      <GeocontenidosLoader v-if="cargando" mensaje="Guardando..." />

      <div v-else class="texto-centrado texto-tamanio-8">
        <span :class="`pictograma-${pictograma}`" />
      </div>

      <template #pie>
        <p class="m-0">{{ mensaje }}</p>
      </template>
    </GeocontenidosSisdaiModal>
  </ClientOnly>
</template>

<script>
export const valoresPorDefecto = {
  cargando: false,
  mensaje: '',
  permitirCerrar: false,
  pictograma: 'aprobado',
  visible: false,
  titulo: '',
};
</script>

<style lang="scss">
.geocontenidos-modal {
  .modal-pie {
    margin: 0 !important;
    justify-content: center;
  }
}
</style>
