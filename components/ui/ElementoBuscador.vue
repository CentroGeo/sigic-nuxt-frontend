<script setup>
// De momento el campo de búsqueda, busca únicamente en el titulo
// Además, el filtro avanzado de institución no funciona
// porque hay que revisar en el módulo de carga cómo se recolectará esa información
// El filtro avanzado de keywords está buscando en el título únicamente
// Falta poder volver a deseleccionar los filtros
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";

const resourcesStore = useSelectedResourcesStore();

const props = defineProps({
  recursosLista: { type: Array, default: () => [] },
  recursosTipo: { type: String, required: true },
  categorias: { type: Array, default: () => [] },
});
const { recursosLista, recursosTipo, categorias } = toRefs(props);

const catalogoFiltrado = ref(recursosLista.value);

const modalFiltros = ref(null);

const seleccionFiltro = ref({
  categoriaSeleccionada: null,
  institucionEntrada: null,
  anioEntrada: null,
  palabrasClaveEntrada: null,
});

function filtrarPorCategoria(d) {
  // console.log("d.category", d.category);
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

// 2025-07-17T19 // TODO:
const filtrarPorAnio = (d) => {
  return d.date !== null &&
    seleccionFiltro.value["anioEntrada"] &&
    d.date.slice(0, 13) === seleccionFiltro.value["anioEntrada"]
    ? 1
    : 0;
};
function filtrarPorAnios(d) {
  // console.log("d.date", d.date);
  // console.log("d.date.slice(0, 7)", d.date.slice(0, 7));
  // console.log(
  //   'seleccionFiltro.value["anioEntrada"]',
  //   seleccionFiltro.value["anioEntrada"]
  // );
  if (
    d.date !== null &&
    seleccionFiltro.value["anioEntrada"] &&
    // d.date.slice(0, 4) === seleccionFiltro.value["anioEntrada"] // lo siguiente solo válida la fecha con cuatro dígitos
    d.date.slice(0, 13) === seleccionFiltro.value["anioEntrada"]
  ) {
    return 1;
  } else {
    return 0;
  }
}

// Para esta función haría falta formatear el input y el título del recursp
function filtrarPorPalabraClave(d) {
  // console.log("d.keywords", d.keywords);
  if (seleccionFiltro.value["palabrasClaveEntrada"]) {
    let palabrasClaveLista = seleccionFiltro.value["palabrasClaveEntrada"]
      .split(",")
      .map((palabra) => palabra.trim())
      .filter((palabra) => palabra.length > 0);
    // console.log("palabrasClaveLista", palabrasClaveLista);

    // probar si hay si el arreglo incluye algo de la palabra
    let includesWord = palabrasClaveLista.some((palabraClave) =>
      d.keywords.includes(palabraClave)
    );
    // console.log("includesWord", includesWord);

    if (includesWord) {
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
    // console.log("d", d);
    if (tf === totalFiltros) {
      resultados.push(d);
    }
  });
  // console.log("Resultado filtrado", resultados);
  catalogoFiltrado.value = resultados;
  // console.log("catalogoFiltrado.value", catalogoFiltrado.value);

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
  <ClientOnly>
    <SisdaiModal ref="modalFiltros">
      <template #encabezado>
        <h2>Filtro avanzado</h2>
      </template>

      <template #cuerpo>
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
    <div>
      <ClientOnly>
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
</template>
