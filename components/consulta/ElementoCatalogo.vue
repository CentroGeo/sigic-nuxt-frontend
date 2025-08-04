<script setup>
// PENDING: Tener en cuenta que no solo tendremos archivos vectoriales
import { onMounted, onUnmounted, ref, toRefs } from 'vue';
import { fetchGeometryType, tooltipContent } from '~/utils/consulta.js';

const selectedStore = useSelectedResources2Store();
const capasSeleccionadas = computed({
  get: () => selectedStore.resourcesList(props.resourceType),
  set: (uuids) => selectedStore.updateSelectedResources(uuids, props.resourceType),
});
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
const { catalogueElement } = toRefs(props);

const subtype = ref(catalogueElement.value.subtype);
const geomType = ref(null);
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

onMounted(() => {
  // Esto es para observar cuando la tarjeta entra en la vista
  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Primero checamos si no es dataset
          if (props.resourceType !== 'dataLayer') {
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
    <div class="tarjeta-elemento">
      <input
        :id="`checkbox-consulta-catalogo-${catalogueElement.uuid}`"
        v-model="capasSeleccionadas"
        type="checkbox"
        :value="catalogueElement.uuid"
      />

      <label :for="`checkbox-consulta-catalogo-${catalogueElement.uuid}`">
        {{ catalogueElement.title }}
      </label>
    </div>

    <div class="flex flex-contenido-inicio m-y-3">
      <span
        v-for="(button, i) in buttons"
        :key="i"
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
</style>
