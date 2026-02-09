<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
const props = defineProps({
  service: {
    type: Object,
    default: () => {},
  },
});
const { service } = toRefs(props);
const modalCatalogoExterno = ref(null);

function abrirModalCatalogoExterno() {
  modalCatalogoExterno.value?.abrirModal();
}

defineExpose({
  abrirModalCatalogoExterno,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalCatalogoExterno">
      <template #encabezado>
        <p style="color: transparent">.</p>
      </template>
      <template #cuerpo>
        <h2 class="m-y-0">{{ service.title }}</h2>
        <p class="m-y-1 descripcion">{{ service.descripcion }}</p>
        <div class="flex">
          <div class="borde-redondeado-8 p-1 etiquetas">Catálogo Sugerido</div>
        </div>
        <p>{{ service.abstract }}</p>
        <p>
          Origen: <a :href="service.origen_url" target="_blank"> {{ service.origen }} </a>
        </p>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.descripcion {
  color: var(--texto-secundario);
}
.etiquetas {
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  border: solid 1px var(--color-primario-4);
}
</style>
