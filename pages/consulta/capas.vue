<script setup>
const resourceType = "dataset";
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
        titulo="Capas geográficas"
        :resource-type="resourceType"
        :resources-list="resourcesList"
        etiqueta-elementos="Capas"
      />
    </template>

    <template #visualizador>Mapa</template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
