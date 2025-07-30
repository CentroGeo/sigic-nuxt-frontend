<script setup>
// PENDING: Tener en cuenta que no solo tendremos archivos vectoriales
import { ref, toRefs, onMounted, onUnmounted } from 'vue';
import { useSelectedResourcesStore } from '~/stores/selectedResources.js';
import { tooltipContent, fetchGeometryType } from '~/utils/consulta.js';
const config = useRuntimeConfig();
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  resourceType: {
    type: String,
    default: String,
  },
  catalogueElement: {
    type: Object,
    default: Object,
  },
});
const { resourceType, catalogueElement } = toRefs(props);
// const api = config.public.geoserverUrl;
const subtype = ref(catalogueElement.value.subtype);
const geomType = ref(null);
const isChecked = ref(false);
const buttons = ref([]);
const optionsDict = {
  Point: { tooltipText: 'Capa de puntos', class: 'pictograma-capa-puntos' },
  MultiPoint: {
    tooltipText: 'Capa de puntos',
    class: 'pictograma-capa-puntos',
  },
  Polygon: {
    tooltipText: 'Capa de poligonos',
    class: 'pictograma-capa-poligono',
  },
  MultiPolygon: {
    tooltipText: 'Capa de poligonos',
    class: 'pictograma-capa-poligono',
  },
  LineString: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  LinearRing: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  MultiLineString: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  GeometryCollection: {
    tooltipText: 'Colección de geometrías',
    class: 'pictograma-capas',
  },
  Raster: {
    tooltipText: 'Raster',
    class: 'pictograma-capas',
  },
  Otro: {
    tooltipText: 'Ni raster ni vector',
    class: 'pictograma-flkt',
  },
  Error: {
    tooltipText: 'No se pudo recuperar la información',
    class: 'pictograma-alerta',
  },
};
// Para triggerear la función de observar
let observer;
const rootEl = ref();

// Manjeamos el checkbox y controlamos los elementos seleccionados
function selectElement(resourceType, option) {
  isChecked.value = !isChecked.value;
  if (isChecked.value) {
    resourcesStore.addResource(resourceType, option);
  } else {
    resourcesStore.removeResource(resourceType, option);
  }
}

// Si está en la lista de elementos seleccionados, mostrarla palomeada. Esto es para cuando cambiamos de vista
function setCheck() {
  if (
    resourcesStore.selectedResources[resourceType.value]?.some(
      (r) => r.uuid === catalogueElement.value.uuid
    )
  ) {
    isChecked.value = true;
  } else {
    isChecked.value = false;
  }
}
setCheck();

// Como también se puede modificar la lista desde el panel de seleccion, montamos un watcher
// para despalomear las opciones que se borraron
watch(
  () => resourcesStore.selectedResources[resourceType.value],
  () => {
    setCheck();
  },
  { deep: true }
);

onMounted(() => {
  // Esto es para observar cuando la tarjeta entra en la vista
  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Primero checamos si no es dataset
          if (resourceType.value !== 'dataLayer') {
            buttons.value = [
              {
                tooltipText: tooltipContent(catalogueElement.value),
                class: 'pictograma-informacion',
                position: 'derecha',
              },
            ];
          } else {
            // Si es raster
            if (subtype.value === 'raster') {
              geomType.value = 'Raster';
            } else if (subtype.value === 'vector') {
              // Si es vectorial
              // Solicitamos la geometría hasta que la tarjeta va a entrar a la vista
              geomType.value = await fetchGeometryType(catalogueElement.value);
              //geomType.value = "Point";
            } else {
              geomType.value = 'Otro';
            }
            buttons.value = [
              {
                tooltipText: optionsDict[geomType.value].tooltipText,
                class: optionsDict[geomType.value].class,
                position: 'arriba',
              },
              {
                tooltipText: 'Variables disponibles',
                class: 'pictograma-visualizador',
                position: 'arriba',
              },
              {
                tooltipText: tooltipContent(catalogueElement.value),
                class: 'pictograma-informacion',
                position: 'derecha',
              },
            ];
          }
          observer.unobserve(entry.target);
        }
      }
    },
    {
      //Esto es para que se dispare la función de petición de recursos
      // 300px antes de que el componente entre a la vista
      root: null,
      rootMargin: '300px',
    }
  );

  if (rootEl.value) {
    observer.observe(rootEl.value);
  }
});
onUnmounted(() => {
  if (observer && rootEl.value) {
    observer.unobserve(rootEl.value);
  }
});
</script>
<template>
  <div :id="`elemento-${catalogueElement.uuid}`" ref="rootEl" class="m-x-5 m-y-2">
    <div class="tarjeta-elemento" @click="selectElement(resourceType, catalogueElement)">
      <input :id="`checkbox-${catalogueElement.uuid}`" v-model="isChecked" type="checkbox" >
      <label :for="catalogueElement.uuid">{{ catalogueElement.title }}</label>
    </div>

    <div class="flex flex-contenido-inicio m-y-3">
      <span
        v-for="button in buttons"
        v-globo-informacion:[button.position]="button.tooltipText"
        :class="[button.class, 'pictograma-mediano']"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
.tarjeta-elemento:hover {
  background-color: var(--color-secundario-2);
  border: 1px solid var(--color-secundario-8);
  border-radius: 8px;
}
</style>
