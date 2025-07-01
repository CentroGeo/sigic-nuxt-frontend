<script setup>
const resourceType = "document";
const { resourcesList } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 1000,
  resourceType,
});
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Documentos"
        :resource-type="resourceType"
        :resources-list="resourcesList"
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
