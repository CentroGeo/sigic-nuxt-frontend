<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { resourceTypeGeonode } from '~/utils/consulta';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  resourceType: { type: String, required: true },
});
const { categories } = toRefs(props);
const storeFetched = useFetchedResourcesStore();
const resources = computed(() => storeFetched[props.resourceType]);
const emit = defineEmits(['applyFilter','resetFilter']);
const modalBusqueda = ref(null);
const institutionInput = ref('');
const yearInput = ref('');
const keywordsInput = ref('');
const inputCategories = ref([]);


const results = ref([]);
const categoriesDict = {
  "Imagery Base Maps Earth Cover": 'imageryBaseMapsEarthCover',
  "Society": 'society',
  "Economy": 'economy',
  "Utilities Communication": 'utilitiesCommunication',
  "Environment": 'environment',
  'Oceans': 'oceans',
  'Biota': 'biota',
  'Health': 'health',
  'Elevation': 'elevation',
  'Geoscientific Information': 'geoscientificInformation',
  'Planning Cadastre': 'planningCadastre',
  'Inland Waters': 'inlandWaters',
  'Boundaries': 'boundaries',
  'Structure': 'structure',
  'Transportation': 'transportation',
  'Intelligence Military': 'intelligenceMilitary',
  'Location': 'location',
  'Climatology Meteorology Atmosphere': 'climatologyMeteorologyAtmosphere',
  'Farming': 'farming',
  'Population': 'population',
}
function abrirModalBusqueda() {
  modalBusqueda.value?.abrirModal();
}

defineExpose({
  abrirModalBusqueda,
});


async function filterByModal() {
  const { data } = useAuth();
  let queryParams = {'filter{resource_type}': resourceTypeGeonode[props.resourceType]}

  if(institutionInput.value){
    queryParams['institution'] = institutionInput.value
  }
  if(yearInput.value){
    queryParams['year'] = yearInput.value
  }
  if(keywordsInput.value){
    queryParams['keywords_csv'] = keywordsInput.value
  }
  if(inputCategories.value.length > 0){
    let catParam = []
    inputCategories.value.forEach((d) => {
      catParam.push(categoriesDict[d])
    })
    queryParams['filter{category.identifier}'] = catParam
  } 

  results.value = await $fetch('/api/catalogo', {
    method: 'GET',
    query: queryParams,
    headers: {
      Authorization: `${data.value?.accessToken}`
    }
  });
  emit('applyFilter', results.value) 
  modalBusqueda.value.cerrarModal();
}

function resetResults() {
  results.value = resources.value;
  emit('resetFilter', results.value);
  modalBusqueda.value.cerrarModal();
}
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalBusqueda">
      <template #encabezado>
        <h1>Filtro avanzado</h1>
      </template>

      <template #cuerpo>
        <label>Categoria</label>
        <div class="grupo-categoria flex">
          <SisdaiCasillaVerificacion
            v-for="(category, index) in categories"
            :key="`${index}-category`"
            v-model="inputCategories"
            :value="category"
            :etiqueta="category"
            class="opcion-checkbox"
          />
          <button class="boton-chico opcion-checkbox">Limpiar selección</button>
        </div>

        <SisdaiCampoBase
          v-model="institutionInput"
          id="filtro-institicion"
          class="m-y-2"
          etiqueta="Institución"
          ejemplo="SECIHTI, INEGI, entre otras"
        />

        <SisdaiCampoBase
          v-model="yearInput"
          id="filtro-anio"
          class="m-y-2"
          etiqueta="Año de publicación"
          ejemplo="1995..."
        />

        <SisdaiCampoBase
          v-model="keywordsInput"
          id="filtro-keywords"
          class="m-y-2"
          etiqueta="Palabras clave"
          ejemplo="agua, casas..."
        />
      </template>

      <template #pie>
        <div class="contenedor-botones flex flex-contenido-centrado">
          <button class="boton-chico boton-primario" @click="filterByModal">Buscar</button>
          <button class="boton-chico boton-secundario" @click="resetResults">
            Restablecer filtros
          </button>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.grupo-categoria {
  border: solid var(--campo-etiqueta-color) 1px;
  border-radius: 8px;
  gap: 0px;

  button {
    font-size: 1rem;
    color: var(--color-interactivo-1);
    background-color: var(--color-neutro-0);
    border-radius: 8px;
  }
}
.opcion-checkbox {
  width: 50%;
}
.contenedor-botones {
  width: 100%;

  button {
    width: 45%;
  }
}
</style>
