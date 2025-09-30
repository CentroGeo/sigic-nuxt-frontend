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
  get: () => storeSelected.lastVisible().pk,
  set: (newSelectedPk) => storeSelected.setOnlyOneVisible(newSelectedPk),
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
        :id="resourceElement.pk"
        v-model="selectedResource"
        type="radio"
        :name="groupName"
        :value="resourceElement.pk"
        :checked="resourceElement.pk === selectedResource"
      />
      <label :for="resourceElement.pk">{{ resourceElement.title || 'Cargando...' }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        v-globo-informacion:derecha="'Capas'"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        @click="emit('mapaClicked')"
      >
        <span class="pictograma-capas" aria-hidden="true" />
      </button>

      <button
        v-globo-informacion:derecha="'Eliminar'"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Borrar selección"
        type="button"
        @click="() => storeSelected.removeByPk(resourceElement.pk)"
      >
        <span class="pictograma-eliminar" aria-hidden="true" />
      </button>

      <button
        v-if="resourceElement.sourcetype !== 'REMOTE'"
        v-globo-informacion:derecha="'Descargar'"
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
