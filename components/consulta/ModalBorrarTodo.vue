<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeSelected = useSelectedResources2Store();
const modalBorrarTodo = ref(null);
function abrirModalBorrarTodo() {
  modalBorrarTodo.value?.abrirModal();
}
function cancelarClicked() {
  modalBorrarTodo.value?.cerrarModal();
}
function eliminarClicked() {
  storeSelected.reset();
  modalBorrarTodo.value?.cerrarModal();
}
defineExpose({
  abrirModalBorrarTodo,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalBorrarTodo">
      <template #encabezado>
        <h1>¿Quieres borrar toda la selección?</h1>
      </template>

      <template #cuerpo>
        <div class="contenedor flex">
          <button type="button" class="boton-secundario" @click="cancelarClicked()">
            Cancelar
          </button>
          <button type="button" class="boton-primario" @click="eliminarClicked()">Eliminar</button>
        </div>
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
