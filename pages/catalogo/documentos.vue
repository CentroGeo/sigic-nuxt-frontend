<script setup>
// TODO: fix filtros avanzados y paginador
// import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();

storeFilters.resourceType = 'document';

storeFetched.checkFilling(resourceTypeDic.document);

const resourcesTablas = computed(() => storeFetched.byResourceType(resourceTypeDic.document));
const filteredResources = ref([]);
const tableResources = ref([]);
const seleccionOrden = ref('');

// obteniendo las variables keys para la tabla
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = filteredResources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: 'Documentos',
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
    enlace_descarga: d.download_url,
    uuid: d.uuid,
  }));
}

watch([resourcesTablas], () => {
  updateResources(storeFilters.sort());
});

watch(seleccionOrden, (nv) => {
  storeFilters.updateFilter('sort', nv);
  updateResources(storeFilters.sort());
});

onMounted(async () => {
  storeFilters.resetAll();
  if (resourcesTablas.value.length !== 0) {
    updateResources(resourcesTablas.value);
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div class="flex">
          <div class="columna-8">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="fecha_descendente">Recién agregados</option>
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_ascendente">Más antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>

          <!-- TODO: implementar filtro avanzado -->
          <!-- <div class="columna-8 flex-vertical-final">
            <div class="flex flex-contenido-separado">
              <div class="columna-14">
                <ClientOnly>
                  <label for="buscadoravanzado">Buscador</label>
                  <SisdaiCampoBusqueda
                    id="buscadoravanzado"
                    class="columna-13"
                    style="height: 40px"
                    :catalogo="filteredResources"
                    :propiedad-busqueda="'title'"
                    :etiqueta="'Usa palabras clave como: agua'"
                    @al-filtrar="(r) => updateResources(r)"
                  />
                </ClientOnly>
              </div>
              <div class="columna-2 flex-vertical-final">
                <button
                  class="boton-secundario boton-pictograma boton-grande"
                  aria-label="Filtro Avanzado"
                  type="button"
                  @click="modalFiltros?.abrirModal()"
                >
                  <span class="pictograma-filtro" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div> -->
        </div>

        <div class="flex">
          <h2>Documentos</h2>
          <UiNumeroElementos :numero="tableResources.length" />
        </div>

        <div class="flex">
          <div class="columna-16">
            <!-- TODO: implementar paginador -->
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="tableResources" />
              <UiPaginador :total-paginas="1" @cambio="1" />
            </ClientOnly>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
