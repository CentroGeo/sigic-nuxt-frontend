<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";

const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  resourcesList: { type: Array, default: () => [] },
  resourceType: { type: String, required: true },
});
const { resourcesList, resourceType } = toRefs(props);
const catalogoFiltrado = ref(resourcesList.value);

function filtrar(r) {
  catalogoFiltrado.value = r;
  resourcesStore.updateFilteredResources(
    resourceType.value,
    catalogoFiltrado.value
  );
}
</script>
<template>
  <div class="flex flex-contenido-equidistante m-y-3">
    <SisdaiCampoBusqueda
      class="columna-13"
      :catalogo="resourcesList"
      :propiedadBusqueda="'title'"
      :etiqueta="'Usa palabras clave...'"
      @alFiltrar="filtrar"
    />
    <button
      type="button"
      class="boton-primario boton-pictograma boton-grande"
      aria-label="Filtrar"
    >
      <span class="pictograma-filtro" aria-hidden="true"></span>
    </button>
  </div>
</template>
