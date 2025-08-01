<script setup>
const resourcesStore = useSelectedResourcesStore();
const resourceType = 'dataTable';

const paginaActual = ref(0);
const tamanioPagina = 10;

const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: resourcesStore.shownFiles[resourceType],
});

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: resourcesStore.shownFiles[resourceType],
  });
});

// Observa cambios en el recurso seleccionado
watch(
  () => resourcesStore.shownFiles[resourceType],
  () => {
    paginaActual.value = 0;
    fetchTable({
      paginaActual: paginaActual.value,
      tamanioPagina: tamanioPagina,
      resource: resourcesStore.shownFiles[resourceType],
    });
  }
);
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
      <div v-if="!resourcesStore.shownFiles[resourceType]" class="contenedor">
        <h1>No hay seleccion</h1>
      </div>
      <div v-else>
        <UiTablaAccesible :variables="variables" :datos="datos" :caption="'una descripción'" />
        <UiPaginador
          :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
      </div>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Tabulados de datos"
        :resource-type="resourceType"
        etiqueta-elementos="Datos tabulados"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
