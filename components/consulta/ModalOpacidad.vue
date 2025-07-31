<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiControlDeslizante from "@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue";
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
//const resourcesStore = useSelectedResourcesStore();
const controlOpacidad = ref();
const modalOpacidad = ref(null);
function abrirModalOpacidad() {
  modalOpacidad.value?.abrirModal();
}

defineExpose({
  abrirModalOpacidad,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalOpacidad">
      <template #encabezado>
        <h1>Opacidad</h1>
      </template>

      <template #cuerpo>
        <p>{{ selectedElement.title }}</p>
        <div class="contenedor">
          <SisdaiControlDeslizante
            :val_min="0"
            :val_max="100"
            :val_entrada="100"
            id="contro-opacidad"
            step="10"
            ref="controlOpacidad"
            @update:val_entrada="
              ($event) => (controlOpacidad.valor_seleccionado = $event)
            "
          >
          </SisdaiControlDeslizante>
          <div>{{ controlOpacidad?.valor_seleccionado }}%</div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
