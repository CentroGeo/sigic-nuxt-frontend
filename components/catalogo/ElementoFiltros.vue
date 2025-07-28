<script setup>
// Se está pensando en añadir una propiedad para colocar
// el selector a los filtros avanzados. comparte las mismas
// características que el ElementoBuscador del módulo de consulta
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
const seleccionEjemplo = ref("");
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  recursosLista: { type: Array, default: () => [] },
  recursosTipo: { type: String, required: true },
  categorias: { type: Array, default: () => [] },
  conSelector: { type: Boolean, default: false },
});
const { recursosLista, recursosTipo, categorias, conSelector } = toRefs(props);
const catalogoFiltrado = ref(recursosLista.value);
const modalFiltros = ref(null);
const seleccionFiltro = ref({
  categoriaSeleccionada: null,
  institucionEntrada: null,
  anioEntrada: null,
  palabrasClaveEntrada: null,
});
function filtrarPorCategoria(d) {
  if (
    d.category !== null &&
    seleccionFiltro.value["categoriaSeleccionada"] &&
    d.category === seleccionFiltro.value["categoriaSeleccionada"]
  ) {
    return 1;
  } else {
    return 0;
  }
}
// se agrega el filtrarPorInstitucion
function filtrarPorInstitucion(d) {
  // console.log("d.attribution", d.attribution);
  if (seleccionFiltro.value["institucionEntrada"]) {
    let institucionesLista = seleccionFiltro.value["institucionEntrada"]
      .split(",")
      .map((institucion) => institucion.trim())
      .filter((instituciones) => instituciones.length > 0);
    // console.log("institucionesLista", institucionesLista);

    // probar si hay si el arreglo incluye algo de la palabra
    let institucionesIncluidas = institucionesLista.some((institucion) =>
      d.keywords.includes(institucion)
    );
    // console.log("institucionesIncluidas", institucionesIncluidas);

    if (institucionesIncluidas) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
const filtrarPorAnio = (d) => {
  // 2025-07-17T19 // TODO:
  return d.date !== null &&
    seleccionFiltro.value["anioEntrada"] &&
    /* d.date.slice(0, 4) === seleccionFiltro.value["anioEntrada"] // lo siguiente solo válida la fecha con cuatro dígitos*/
    d.date.slice(0, 13) === seleccionFiltro.value["anioEntrada"]
    ? 1
    : 0;
};
// Para esta función haría falta formatear el input y el título del recursp
// function filterByKeyword(d) {
function filtrarPorPalabraClave(d) {
  if (seleccionFiltro.value["palabrasClaveEntrada"]) {
    let palabrasClaveLista = seleccionFiltro.value["palabrasClaveEntrada"]
      .split(",")
      .map((palabra) => palabra.trim())
      .filter((palabra) => palabra.length > 0);
    // probar si hay si el arreglo incluye algo de la palabra
    let incluyePalabras = palabrasClaveLista.some((palabraClave) =>
      d.keywords.includes(palabraClave)
    );
    if (incluyePalabras) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
// La idea sería generar un filtro por categoría y, sacar el numero de filtros aplicados y
// revisar que sumen un total
// function filterByModal() {
function filtrarPorModal() {
  // total de filtros usados
  let totalFiltros = 0;
  // resultados ya filtrados
  let resultados = [];
  // Revisamos cuántos filtros se aplicaron
  Object.keys(seleccionFiltro.value).forEach((d) => {
    if (seleccionFiltro.value[d]) {
      totalFiltros += 1;
    }
  });
  console.log("total de filtros usados", totalFiltros);
  // Revisamos la suma por filtro
  recursosLista.value.forEach((d, idx) => {
    let tf =
      filtrarPorCategoria(d) +
      filtrarPorInstitucion(d) +
      filtrarPorAnio(d) +
      filtrarPorPalabraClave(d);
    // console.log("coincidencias de filtro con el objeto", idx, ":", tf);
    if (tf === totalFiltros) {
      resultados.push(d);
    }
  });
  // console.log("Resultado filtrado", resultados);
  catalogoFiltrado.value = resultados;
  // actualizar Recursos con lista filtrada en el store
  resourcesStore.updateFilteredResources(
    recursosTipo.value,
    catalogoFiltrado.value
  );
  modalFiltros.value.cerrarModal();
}
function filtrarPorEntrada(r) {
  catalogoFiltrado.value = r;
  resourcesStore.updateFilteredResources(
    recursosTipo.value,
    catalogoFiltrado.value
  );
}
</script>
<template>
  <div class="filtros-avanzados">
    <ClientOnly>
      <SisdaiModal ref="modalFiltros">
        <template #encabezado>
          <h2>Filtro avanzado</h2>
        </template>

        <template #cuerpo>
          <!-- se añida formulario Form -->
          <form @keypress.enter.exact.prevent="filtrarPorModal()">
            <ClientOnly>
              <SisdaiSelector
                v-model="seleccionFiltro['categoriaSeleccionada']"
                etiqueta="Categoría"
                instruccional="Selecciona Categoría"
              >
                <option
                  v-for="(categoria, index) in categorias"
                  :key="`categoria-${index}`"
                  :value="categoria"
                >
                  {{ categoria }}
                </option>
              </SisdaiSelector>
              <SisdaiCampoBase
                v-model="seleccionFiltro['institucionEntrada']"
                etiqueta="Institución"
                ejemplo="SECIHTI, INEGI, entre otras"
              />
              <SisdaiCampoBase
                v-model="seleccionFiltro['anioEntrada']"
                etiqueta="Año de publicación"
                ejemplo="1995..."
              />
              <SisdaiCampoBase
                v-model="seleccionFiltro['palabrasClaveEntrada']"
                etiqueta="Palabras clave"
                ejemplo="agua, casas..."
              />
            </ClientOnly>
          </form>
        </template>

        <template #pie>
          <!-- se agrega aria-label -->
          <button
            class="boton-primario"
            aria-label="Aplicar filtros"
            type="button"
            @click="filtrarPorModal"
          >
            Aplicar
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>

    <div class="flex">
      <div class="columna-8">
        <ClientOnly>
          <SisdaiSelector v-model="seleccionEjemplo" etiqueta="Ordenar por">
            <option value="1">Recién agregados</option>
            <option value="2">Opcion Dos</option>
            <option value="3">Opcion Tres</option>
          </SisdaiSelector>
        </ClientOnly>
      </div>
      <div class="columna-8 flex-vertical-final">
        <div class="flex">
          <div>
            <ClientOnly>
              <!-- se agrega label for -->
              <label for="buscadoravanzado">Buscador</label>
              <SisdaiCampoBusqueda
                id="buscadoravanzado"
                class="columna-13"
                style="height: 40px"
                :catalogo="recursosLista"
                :propiedad-busqueda="'title'"
                :etiqueta="'Usa palabras clave...'"
                @al-filtrar="filtrarPorEntrada"
              />
            </ClientOnly>
          </div>
          <div class="flex-vertical-final">
            <button
              class="boton-primario boton-pictograma boton-grande"
              aria-label="Filtro Avanzado"
              type="button"
              @click="modalFiltros?.abrirModal()"
            >
              <span class="pictograma-filtro" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.filtros-avanzados .campo-busqueda-borrar {
  margin: 0px;
}
</style>
