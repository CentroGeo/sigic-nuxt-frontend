<script setup>
const variables = ref([]);
const datos = ref([]);
const paginaActual = ref(0);
const totalFeatures = ref(0);
const tamanioPagina = 10;

const config = useRuntimeConfig();

const resourceType = "dataTable";

const obtenerDatos = async () => {
  const url = new URL(`${config.public.geoserverUrl}/ows`);
  url.search = new URLSearchParams({
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: "geonode:centroides_mapa2_maquinaria_mgn2020",
    outputFormat: "application/json",
    maxFeatures: tamanioPagina,
    startIndex: paginaActual.value * tamanioPagina,
  }).toString();

  const res = await fetch(url);
  const data = await res.json();

  if (data.totalFeatures !== undefined) {
    totalFeatures.value = data.totalFeatures;
  }

  const atributos = data.features.map((f) => f.properties);
  variables.value = Object.keys(atributos[0] || {});
  datos.value = atributos;
};

watch(paginaActual, obtenerDatos, { immediate: true });
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
      <UiPaginador
        :totalPaginas="Math.ceil(totalFeatures / tamanioPagina)"
        @cambio="paginaActual = $event"
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
