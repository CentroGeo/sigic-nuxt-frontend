<script setup>
const resourcesStore = useSelectedResourcesStore();

/* async function obtenerPDFs() {
  const res = await fetch(`${config.public.geonodeApi}/api/v2/documents/`);
  const data = await res.json();
  const docs = data.results;

  docs.forEach((doc) => {
    console.log(`Título: ${doc.title}`);
    console.log(`Descargar: ${config.public.geonodeApi}${doc.download_url}`);
  });
}
obtenerPDFs(); */
const resourceType = 'document';
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
<!--       <div v-if="!resourcesStore.shownFiles[resourceType]" class="contenedor">
        <h1>No hay seleccion</h1>
      </div>
      <ConsultaVisualizacionDocumento v-else /> -->
    </template>

    <template #seleccion>
<!--       <ConsultaLayoutSeleccion
        titulo="Documentos seleccionados"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      /> -->
    </template>
  </ConsultaLayoutPaneles>
</template>

<style scoped>
.documento-embebido {
  width: 100%;
  height: 100%;
}
</style>
