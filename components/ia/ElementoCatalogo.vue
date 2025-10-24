<script setup>
import SisdaiCasilla from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import { onMounted, onUnmounted, ref, toRefs } from 'vue';
/**
 * @typedef {Object} Props
 * @property {Object} [catalogueElement=Object] - Indica el elemento del catálogo.
 * @property {String} [resourceType=''] - Indica el tipo de archivo.
 */
/** @type {Props} */
const props = defineProps({
  catalogueElement: {
    type: Object,
    default: Object,
  },
  resourceType: {
    type: String,
    default: '',
  },
});
const { catalogueElement, resourceType } = toRefs(props);

const storeResources = useResourcesIAStore();
const capasSeleccionadas = computed({
  get: () => storeResources.selectedByType(resourceType.value),
  set: (newValue) => (storeResources.selectedResources[resourceType.value] = newValue),
});
// Para hacer algo si es el enésimo elemento e incorporar el consumo de recursos paginados.
const emit = defineEmits(['triggerFetch']);
const nthElementsPks = computed(() => storeResources.nthElementsByType(resourceType.value));
// const geomDict = {
//   Point: { tooltipText: 'Capa de puntos', class: 'pictograma-capa-puntos' },
//   MultiPoint: {
//     tooltipText: 'Capa de puntos',
//     class: 'pictograma-capa-puntos',
//   },
//   Polygon: {
//     tooltipText: 'Capa de poligonos',
//     class: 'pictograma-capa-poligono',
//   },
//   MultiPolygon: {
//     tooltipText: 'Capa de poligonos',
//     class: 'pictograma-capa-poligono',
//   },
//   LineString: {
//     tooltipText: 'Capa de lineas',
//     class: 'pictograma-capa-lineas',
//   },
//   LinearRing: {
//     tooltipText: 'Capa de lineas',
//     class: 'pictograma-capa-lineas',
//   },
//   MultiLineString: {
//     tooltipText: 'Capa de lineas',
//     class: 'pictograma-capa-lineas',
//   },
//   GeometryCollection: {
//     tooltipText: 'Colección de geometrías',
//     class: 'pictograma-capa-poligono',
//   },
//   Raster: {
//     tooltipText: 'Raster',
//     class: 'pictograma-capas',
//   },
//   Otro: {
//     tooltipText: 'Indefinido',
//     class: 'pictograma-flkt',
//   },
//   Remoto: {
//     tooltipText: 'Capa remota',
//     class: 'pictograma-colaborar',
//   },
//   Error: {
//     tooltipText: 'No se pudo recuperar la información',
//     class: 'pictograma-alerta',
//   },
// };
// Para triggerear la función de observar
let observer;
const rootEl = ref();

onMounted(() => {
  // Esto es para observar cuando la tarjeta entra en la vista
  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (nthElementsPks.value.includes(catalogueElement.value.pk)) {
            emit('triggerFetch');
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
  <div :id="`elemento-${catalogueElement.pk}`" ref="rootEl" class="tarjeta-catalogo">
    <div class="capa p-2 m-b-2 borde-redondeado-20">
      <SisdaiCasilla
        v-model="capasSeleccionadas"
        :etiqueta="catalogueElement.title"
        :value="catalogueElement"
      />
      <!-- <div v-if="resourceType === 'dataLayer'" class="icono">
        <span
          class="m-r-1"
          :class="[geomDict[catalogueElement.geomType].class, 'pictograma-mediano picto']"
          aria-hidden="true"
        />
        <span>{{ geomDict[catalogueElement.geomType].tooltipText }}</span>
      </div> -->
      <div class="icono">
        <span
          v-globo-informacion:derecha="catalogueElement.raw_abstract"
          class="m-r-1"
          :class="['pictograma-informacion', 'pictograma-mediano picto']"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.capa {
  background: var(--fondo-acento);
  color: var(--texto-secundario);

  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  .icono {
    display: flex;
    align-items: center;
  }
}
</style>
