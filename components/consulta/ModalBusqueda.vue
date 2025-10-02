<script setup>
import { ClientOnly } from '#components';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { categoriesInSpanish } from '~/utils/consulta';

const storeFilters = useFilteredResources();
const emit = defineEmits(['applyFilter', 'resetFilter']);
const modalBusqueda = ref(null);
const institutionInput = computed({
  get: () => storeFilters.filters.institutions,
  set: (value) => storeFilters.updateFilter('institutions', value),
});
const yearInput = computed({
  get: () => storeFilters.filters.years,
  set: (value) => storeFilters.updateFilter('years', value),
});
const keywordsInput = computed({
  get: () => storeFilters.filters.keywords,
  set: (value) => storeFilters.updateFilter('keywords', value),
});
const inputCategories = computed({
  get: () => storeFilters.filters.categories,
  set: (value) => storeFilters.updateFilter('categories', value),
});

const categoriesDict = {
  Biota: 'biota',
  Boundaries: 'boundaries',
  'Climatology Meteorology Atmosphere': 'climatologyMeteorologyAtmosphere',
  Economy: 'economy',
  Elevation: 'elevation',
  Environment: 'environment',
  Farming: 'farming',
  'Geoscientific Information': 'geoscientificInformation',
  Health: 'health',
  'Imagery Base Maps Earth Cover': 'imageryBaseMapsEarthCover',
  'Inland Waters': 'inlandWaters',
  'Intelligence Military': 'intelligenceMilitary',
  Location: 'location',
  Oceans: 'oceans',
  'Planning Cadastre': 'planningCadastre',
  Population: 'population',
  Society: 'society',
  Structure: 'structure',
  Transportation: 'transportation',
  'Utilities Communication': 'utilitiesCommunication',
  'Sin Clasificar': 'Sin clasificar',
};
function abrirModalBusqueda() {
  modalBusqueda.value?.abrirModal();
}

function cerrarModalBusqueda() {
  modalBusqueda.value?.cerrarModal();
}

defineExpose({
  abrirModalBusqueda,
  cerrarModalBusqueda,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal id="modal-busqueda" ref="modalBusqueda">
      <template #encabezado>
        <h1>Filtro avanzado</h1>
      </template>

      <template #cuerpo>
        <label for="filtro-categoria">Categoria</label>
        <div class="grupo-categoria flex p-1">
          <SisdaiCasillaVerificacion
            v-for="(category, index) in Object.keys(categoriesDict)"
            :key="`${index}-category`"
            v-model="inputCategories"
            name="filtro-categoria"
            :value="categoriesDict[category]"
            :etiqueta="categoriesInSpanish[category]"
            class="opcion-checkbox"
          />
          <button
            class="boton-chico opcion-checkbox boton-secundario"
            @click="storeFilters.updateFilter('categories', [])"
          >
            Limpiar selección
          </button>
        </div>

        <ClientOnly>
          <SisdaiCampoBase
            id="filtro-institucion"
            v-model="institutionInput"
            tipo='"text"'
            class="m-y-1"
            etiqueta="Institución"
            ejemplo="INEGI,..."
          />
        </ClientOnly>
        <ClientOnly>
          <SisdaiCampoBase
            id="filtro-anio"
            v-model="yearInput"
            tipo='"text"'
            class="m-y-1"
            etiqueta="Año de publicación"
            ejemplo="1995...."
          />
        </ClientOnly>

        <ClientOnly>
          <SisdaiCampoBase
            id="filtro-keywords"
            v-model="keywordsInput"
            tipo='"text"'
            class="m-y-1"
            etiqueta="Palabras clave"
            ejemplo="casa, agua..."
          />
        </ClientOnly>
      </template>

      <template #pie>
        <div class="contenedor-botones flex flex-contenido-centrado">
          <button class="boton-chico boton-primario" @click="emit('applyFilter')">Buscar</button>
          <button class="boton-chico boton-secundario" @click="emit('resetFilter')">
            Restablecer filtros
          </button>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
#modal-busqueda {
  max-width: 32%;
}

.grupo-categoria {
  border: solid var(--campo-etiqueta-color) 1px;
  border-radius: 8px;
  gap: 0px;
}
.opcion-checkbox {
  width: 33%;
}
.contenedor-botones {
  width: 100%;

  button {
    width: 45%;
  }
}
</style>
