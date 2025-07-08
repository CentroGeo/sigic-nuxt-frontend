<script setup>
const variables = ref([]);
const datos = ref([]);
const config = useRuntimeConfig();

const resourceType = "dataTable";

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
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Tabulados de datos"
        :resource-type="resourceType"
        etiqueta-elementos="Datos tabulados"
      />
    </template>

    <template #visualizador>
      <UiTablaAccesible
        :variables="variables"
        :datos="datos"
        :caption="'una descripción'"
      />
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Tabulados de datos"
        :resource-type="resourceType"
        etiqueta-elementos="Datos tabulaos"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
