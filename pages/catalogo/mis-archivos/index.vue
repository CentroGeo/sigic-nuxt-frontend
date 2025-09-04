<script setup>
// TODO: fix filtros avanzados y paginador
// import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();

storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const recursos = computed(() => storeFetched.all);

const filteredResources = ref([]);
const tableResources = ref([]);

const seleccionOrden = ref('');

// obteniendo las variables keys para la tabla
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function tipoRecurso(d) {
  if (d.resource_type === 'document') {
    return 'Documentos';
  } else {
    return isGeometricExtension(d.extent) ? 'Capa geográfica' : 'Datos tabulados';
  }
}

// para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = data.value.user.email;

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = filteredResources.value
    .filter((resource) => resource.owner.email === userEmail)
    .map((d) => ({
      pk: d.pk,
      titulo: d.title,
      tipo_recurso: tipoRecurso(d),
      categoria: d.category === null ? 'Sin clasificar' : d.category.gn_description,
      actualizacion: formatearFecha(d.last_updated),
      acciones: 'Editar, Ver, Descargar, Remover',
      enlace_descarga: d.download_url,
    }));
}

watch([recursos], () => {
  updateResources(storeFilters.sort('all'));
});

watch(seleccionOrden, (nv) => {
  storeFilters.updateFilter('sort', nv);
  updateResources(storeFilters.sort('all'));
});

onMounted(async () => {
  storeFilters.resetAll();
  if (recursos.value.length !== 0) {
    updateResources(recursos.value);
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
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

          <!-- <div class="columna-8 flex-vertical-final">
            <div class="flex">
              <div>
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
              <div class="flex-vertical-final">
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
          <h2>Todos mis archivos</h2>
          <UiNumeroElementos :numero="tableResources.length" />
        </div>
        <div class="flex">
          <div class="columna-15">
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
