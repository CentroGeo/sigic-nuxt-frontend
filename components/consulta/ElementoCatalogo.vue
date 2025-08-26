<script setup>
// PENDING: Tener en cuenta que no solo tendremos archivos vectoriales
import { onMounted, onUnmounted, ref, toRefs } from 'vue';
import { fetchGeometryType, tooltipContent } from '~/utils/consulta';

const storeSelected = useSelectedResources2Store();
const storeConsulta = useConsultaStore();

const capasSeleccionadas = computed({
  get: () => storeSelected.uuids,
  set: (uuids) => storeSelected.updateByUuids(uuids),
});
const props = defineProps({
  catalogueElement: {
    type: Object,
    default: Object,
  },
});
const { catalogueElement } = toRefs(props);
//console.log(catalogueElement.value);

const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
const userEmail = ref(data.value?.user.email);
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
    class: 'pictograma-capa-poligono',
  },
  Raster: {
    tooltipText: 'Raster',
    class: 'pictograma-capas',
  },
  Otro: {
    tooltipText: 'Indefinido',
    class: 'pictograma-flkt',
  },
  Remoto: {
    tooltipText: 'Capa remota',
    class: 'pictograma-colaborar',
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
          if (storeConsulta.resourceType !== 'dataLayer') {
            buttons.value = [
              {
                tooltipText: tooltipContent(catalogueElement.value),
                class: 'pictograma-informacion',
                position: 'derecha',
              },
            ];
          } else {
            if (subtype.value === 'remote') {
              geomType.value = 'Remoto';
            } else if (subtype.value === 'raster') {
              // Si es raster
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
  <div :id="`elemento-${catalogueElement.uuid}`" ref="rootEl" class="tarjeta-catalogo">
    <div
      v-if="isLoggedIn && catalogueElement.owner.email === userEmail"
      class="id-tag flex m-b-1 m-t-0"
    >
      <span class="pictograma-persona"></span>
      Mis archivos
    </div>
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
        :class="[button.class, 'pictograma-mediano picto']"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
.tarjeta-catalogo {
  border-bottom: 1px solid var(--color-neutro-2);
  padding: 16px 40px;
}
.id-tag {
  background-color: var(--fondo-acento);
  padding: 8px;
  border: solid 1px;
  border-radius: 8px;
  color: var(--campo-etiqueta-color);
  width: fit-content;
  align-items: center;
}
.picto {
  color: var(--campo-etiqueta-color);
}
.picto:hover {
  background-color: var(--color-secundario-2);
  border-radius: 8px;
}
</style>
