<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
const resourcesStore = useSelectedResourcesStore();

const modalTabla = ref(null);
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
  resource: selectedElement.value,
});

function abrirModalTabla() {
  modalTabla.value?.abrirModal();
}
function openTableView() {
  console.log(selectedElement.value);
  resourcesStore.addResource("dataTable", selectedElement.value);
  resourcesStore.setShownFile("dataTable", selectedElement.value);
  modalTabla.value?.cerrarModal();
  console.log("Redirije al visor de tablas");
}

defineExpose({
  abrirModalTabla,
});

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalTabla" id="modalTabla">
      <template #encabezado>
        <h1>{{ selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <UiTablaAccesible :variables="variables" :datos="datos" />
        <UiPaginador
          :totalPaginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
      </template>

      <template #pie>
        <nuxtLink to="/consulta/tablas">
          <button type="button" class="boton-primario" @click="openTableView">
            Abrir en Tablas
          </button>
        </nuxtLink>

        <button type="button" class="boton-primario">Descargar</button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
#modalTabla {
  height: 80%;
  gap: 0;
}
</style>
