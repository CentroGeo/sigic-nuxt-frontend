<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeSelected = useSelectedResources2Store();
const emit = defineEmits(['descargaClicked', 'mapaClicked']);

const props = defineProps({
  groupName: { type: String, required: true },
  resourceElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { groupName, resourceElement } = toRefs(props);

const selectedResource = computed({
  get() {
    return storeSelected.visibleOnes()?.[0]['uuid'];
  },
  set(newSelectedUuid) {
    const oldSelectedUuid = storeSelected.visibleOnes()?.[0]['uuid'];
    storeSelected.byUuid(oldSelectedUuid).toggleVisibility();
    storeSelected.byUuid(newSelectedUuid).toggleVisibility();
  },
});
const hasGeometry = ref();

watch(resourceElement, () => {
  // checkForGeometry
  if (props.resourceType === resourceTypeDic.dataTable) {
    const noGeometry = [-1, -1, 0, 0];

    const a = resourceElement.value.extent.coords.join(',');
    const b = noGeometry.join(',');
    if (a === b) {
      hasGeometry.value = false;
    } else {
      hasGeometry.value = true;
    }
  } else {
    hasGeometry.value = false;
  }
});
</script>

<template>
  <div>
    <div>
      <input
        :id="resourceElement.uuid"
        v-model="selectedResource"
        type="radio"
        :name="groupName"
        :value="resourceElement.uuid"
      />
      <label :for="resourceElement.uuid">{{ resourceElement.title }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        @click="emit('mapaClicked')"
      >
        <span class="pictograma-capas" aria-hidden="true" />
      </button>

      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Borrar selección"
        type="button"
        @click="() => storeSelected.removeByUuid(resourceElement.uuid)"
      >
        <span class="pictograma-eliminar" aria-hidden="true" />
      </button>

      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Descargar selección"
        type="button"
        @click="emit('descargaClicked')"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
