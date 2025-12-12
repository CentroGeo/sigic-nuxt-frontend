<script setup>
import { onMounted, onUnmounted, ref, toRefs } from 'vue';
import { tooltipContent } from '~/utils/consulta';

const { data } = useAuth();
const storeSelected = useSelectedResources2Store();
const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const props = defineProps({
  catalogueElement: {
    type: Object,
    default: Object,
  },
});
const { catalogueElement } = toRefs(props);
const capasSeleccionadas = computed({
  get: () => storeSelected.pks,
  set: (pks) => storeSelected.updateByPks(pks, props.catalogueElement.default_style),
});

const isLoggedIn = ref(data.value ? true : false);
const nthElementsPks = computed(() => storeResources.nthElementsByType());
const geomType = ref(catalogueElement.value.geomType ? catalogueElement.value.geomType : 'Otro');
const geomDict = {
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
const emit = defineEmits(['triggerFetch']);

// Para triggerear la función de observar
let observer;
const rootEl = ref();

const iconOptions = {
  dataLayer: [
    {
      tooltipText: geomDict[geomType.value].tooltipText,
      class: geomDict[geomType.value].class,
      position: 'arriba',
    },
    {
      tooltipText: `${catalogueElement.value.styles?.length} Variables disponibles`,
      class: 'pictograma-visualizador',
      position: 'arriba',
    },
    {
      tooltipText: tooltipContent(catalogueElement.value),
      class: 'pictograma-informacion',
      position: 'derecha',
    },
  ],
  dataTable: [
    {
      tooltipText: tooltipContent(catalogueElement.value),
      class: 'pictograma-informacion',
      position: 'derecha',
    },
  ],
  document: [
    {
      tooltipText: tooltipContent(catalogueElement.value),
      class: 'pictograma-informacion',
      position: 'derecha',
    },
  ],
};

watch(capasSeleccionadas, () => {
  storeResources.fetchResourcesByPk(storeConsulta.resourceType, storeSelected.pks);
});

onMounted(() => {
  // Esto es para observar cuando la tarjeta entra en la vista
  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (nthElementsPks.value.includes(catalogueElement.value.pk)) {
            emit('triggerFetch', catalogueElement.value.category.gn_description);
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
    <!--isLoggedIn && catalogueElement.owner.email === userEmail && !catalogueElement.is_published-->
    <div
      v-if="
        isLoggedIn &&
        catalogueElement.is_approved === false &&
        catalogueElement.is_published === false
      "
      class="id-tag flex m-b-1 m-t-0"
    >
      <span class="pictograma-persona"></span>
      Mis Archivos
    </div>
    <div v-if="catalogueElement.sourcetype === 'REMOTE'" class="id-tag flex m-b-1 m-t-0">
      <span class="pictograma-colaborar"></span>
      Catálogo Externo
    </div>

    <div class="tarjeta-elemento">
      <input
        :id="`checkbox-consulta-catalogo-${catalogueElement.pk}`"
        v-model="capasSeleccionadas"
        type="checkbox"
        :value="catalogueElement.pk"
      />

      <label :for="`checkbox-consulta-catalogo-${catalogueElement.pk}`">
        {{ catalogueElement.title }}
      </label>
    </div>

    <div class="flex flex-contenido-inicio m-y-3">
      <span
        v-for="(button, i) in iconOptions[storeConsulta.resourceType]"
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
