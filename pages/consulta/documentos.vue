<script setup>
const resourcesStore = useSelectedResourcesStore();
const resourceType = "document";
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Documentos"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      />
    </template>

    <template #visualizador>
      <div class="contenedor" v-if="!resourcesStore.shownFiles[resourceType]">
        <h1>No hay seleccion</h1>
      </div>
      <ConsultaVisualizacionDocumento v-else></ConsultaVisualizacionDocumento>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Documentos seleccionados"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>

<style scoped>
.documento-embebido {
  width: 100%;
  height: 100%;
}
</style>
