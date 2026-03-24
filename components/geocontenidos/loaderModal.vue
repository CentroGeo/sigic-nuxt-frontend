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
  // mensajeCarga: {
  //   type: String,
  //   default: 'Guardando...',
  // },
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
    <GeocontenidosSisdaiModal ref="modal" class="geocontenidos-modal" :permitir-cerrar="false">
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

<style lang="scss">
.geocontenidos-modal {
  .modal-pie {
    margin: 0 !important;
    justify-content: center;
  }
}
</style>
