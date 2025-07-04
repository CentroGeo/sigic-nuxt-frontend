<script setup>
const variables = ref([]);
const datos = ref([]);
const config = useRuntimeConfig();
const url = new URL(`${config.public.geoserverUrl}/ows`);

url.search = new URLSearchParams({
  service: "WFS",
  version: "1.0.0",
  request: "GetFeature",
  typeName: "geonode:pocuf10gw",
  outputFormat: "application/json",
  maxFeatures: 10,
  startIndex: 0,
}).toString();
// Orita nomas jalamos las primeras 10 paginas, después vemos con el paginador

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const atributos = data.features.map((f) => f.properties);
    variables.value = Object.keys(atributos[0]);
    datos.value = atributos;
  });
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>Tablas disponibles</template>

    <template #visualizador>
      <UiTablaAccesible
        :variables="variables"
        :datos="datos"
        :caption="'una descripción'"
      />
      <UiPaginador></UiPaginador>
    </template>

    <template #seleccion>Tablas seleccionadas</template>
  </ConsultaLayoutPaneles>
</template>
