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
  get: () => storeSelected.lastVisible().uuid,
  set: (newSelectedUuid) => storeSelected.setOnlyOneVisible(newSelectedUuid),
});

const hasGeometry = computed(() => {
  if (props.resourceType !== resourceTypeDic.dataTable) return false;

  if (resourceElement.value['extent'] === undefined) return false;

  const a = resourceElement.value.extent.coords.join(',');
  const b = [-1, -1, 0, 0].join(',');
  if (a === b) return false;

  return true;
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
        :checked="resourceElement.uuid === selectedResource"
      />
      <label :for="resourceElement.uuid">{{ resourceElement.title || 'Cargando...' }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        v-globo-informacion:derecha="'Capas'"
        @click="emit('mapaClicked')"
      >
        <span class="pictograma-capas" aria-hidden="true" />
      </button>

      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Borrar selección"
        type="button"
        v-globo-informacion:derecha="'Eliminar'"
        @click="() => storeSelected.removeByUuid(resourceElement.uuid)"
      >
        <span class="pictograma-eliminar" aria-hidden="true" />
      </button>

      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Descargar selección"
        type="button"
        v-globo-informacion:derecha="'Descargar'"
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
