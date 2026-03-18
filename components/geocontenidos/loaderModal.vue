<script setup>
defineProps({
  mensaje: {
    type: String,
    default: '',
  },
  mensajeLoader: {
    type: String,
    default: '',
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
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalStatus">
      <template #encabezado>
        <span v-if="estatusAlGuardar.cargando" />
        <h2 v-else>{{ estatusAlGuardar.estado ? 'Guardado con éxito' : 'Error' }}</h2>
      </template>

      <template #cuerpo>
        <GeocontenidosLoader
          v-if="estatusAlGuardar.cargando"
          :mensaje="estatusAlGuardar.textoCargando"
        />

        <p v-else-if="estatusAlGuardar.estado === false" v-text="estatusAlGuardar.mensaje" />

        <p v-else><span class="pictograma-aprobado pictograma-grande" /></p>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
