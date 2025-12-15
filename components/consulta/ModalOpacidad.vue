<script setup>
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeSelected = useSelectedResources2Store();

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
const controlOpacidad = ref();
const modalOpacidad = ref(null);

function abrirModalOpacidad() {
  modalOpacidad.value?.abrirModal();
}
const valorOpacidad = ref();

defineExpose({
  abrirModalOpacidad,
});

watch(valorOpacidad, (nv) => (storeSelected.byPk(selectedElement.value.pk).opacidad = nv / 100));
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalOpacidad">
      <template #encabezado>
        <h1>Opacidad</h1>
      </template>

      <template #cuerpo>
        <p>{{ selectedElement.title }}</p>
        <div class="contenedor flex">
          <div class="columna-11">
            <SisdaiControlDeslizante
              id="contro-opacidad"
              ref="controlOpacidad"
              class="deslizante"
              :val_min="0"
              :val_max="100"
              :val_entrada="storeSelected.byPk(selectedElement.pk)?.opacidad * 100 ?? 100"
              step="1"
              @update:val_entrada="
                ($event) => {
                  controlOpacidad.valor_seleccionado = $event;
                  valorOpacidad = controlOpacidad.valor_seleccionado;
                }
              "
            />
          </div>

          <div class="columna-5">
            <input
              type="number"
              :value="controlOpacidad?.valor_seleccionado"
              min="0"
              max="100"
              step="1"
              @change="
                (e) => {
                  valorOpacidad = e.target.value;
                }
              "
            />
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.contenedor {
  margin: 0px;
  padding: 8px;
  align-items: center;
}

.tarjeta {
  background-color: var(--color-neutro-0);
  border: 1px solid var(--color-secundario-8);
}
</style>
