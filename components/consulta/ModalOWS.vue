<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const modalOWS = ref(null);

function abrirModalOWS() {
  modalOWS.value?.abrirModal();
}

defineExpose({
  abrirModalOWS,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalOWS">
      <template #encabezado>
        <h1>Enlace OWS</h1>
      </template>

      <template #cuerpo>
        <p>El enlace del ows</p>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.contenedor {
  margin: 0px;
  padding: 8px;
  align-items: center;
}

.tarjeta {
  background-color: var(--color-neutro-0);
  border: 1px solid var(--color-secundario-8);
}
</style>
