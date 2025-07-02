<script setup>
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

    <template #visualizador>Documento</template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Documentos seleccionados"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
