<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
const emits = defineEmits(['alOrdenar']);

const props = defineProps({
  catalogo: { type: Array, default: () => [] },
  recursosTipo: { type: String, default: 'recursosTipo' },
  categorias: { type: Array, default: () => [] },
  conSelector: { type: Boolean, default: false },
});

const { catalogo } = toRefs(props);
const seleccionOrden = ref('');

function filtro(seleccion) {
  if (seleccion.trim().length >= 1) {
    // Ordenamos por más reciente
    if (seleccion.trim() === 'fecha_descendente') {
      return catalogo.value.sort((a, b) => {
        if (a.last_updated < b.last_updated) {
          return 1;
        }
        if (a.last_updated > b.last_updated) {
          return -1;
        }
        //
        return 0;
      });
    }
    // Ordenamos por más reciente
    if (seleccion.trim() === 'fecha_ascendente') {
      return catalogo.value.sort((a, b) => {
        if (a.last_updated > b.last_updated) {
          return 1;
        }
        if (a.last_updated < b.last_updated) {
          return -1;
        }
        //
        return 0;
      });
    }
    // Ordenamos por titulo
    if (seleccion.trim() === 'titulo') {
      return catalogo.value.sort((a, b) => {
        const titleA = a.title.toUpperCase();
        const titleB = b.title.toUpperCase();
        if (titleA > titleB) {
          return 1;
        }
        if (titleA < titleB) {
          return -1;
        }
        //
        return 0;
      });
    }
    // Ordenamos por categoria
    if (seleccion.trim() === 'categoria') {
      let conCategoria = catalogo.value.filter((r) => r.category !== null);
      const sinCategoria = catalogo.value.filter((r) => r.category === null);
      conCategoria = conCategoria.sort((a, b) => {
        if (a.category.gn_description > b.category.gn_description) {
          return 1;
        }
        if (a.category.gn_description < b.category.gn_description) {
          return -1;
        }
        //
        return 0;
      });
      return conCategoria.concat(sinCategoria);
    }
  }

  return catalogo.value;
}

watch(seleccionOrden, (nv) => emits('alOrdenar', filtro(nv)));

// // Se está pensando en añadir una propiedad para colocar
// // el selector a los filtros avanzados. comparte las mismas
// // características que el ElementoBuscador del módulo de consulta
// import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
// import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

// const resourcesStore = useSelectedResourcesStore();

// const catalogoFiltrado = ref(catalogo.value);
// const modalFiltros = ref(null);
// const seleccionFiltro = ref({
//   categoriaSeleccionada: null,
//   institucionEntrada: null,
//   anioEntrada: null,
//   palabrasClaveEntrada: null,
// });
// function filtrarPorCategoria(d) {
//   if (
//     d.category !== null &&
//     seleccionFiltro.value['categoriaSeleccionada'] &&
//     d.category === seleccionFiltro.value['categoriaSeleccionada']
//   ) {
//     return 1;
//   } else {
//     return 0;
//   }
// }
// // se agrega el filtrarPorInstitucion
// function filtrarPorInstitucion(d) {
//   // console.log("d.attribution", d.attribution);
//   if (seleccionFiltro.value['institucionEntrada']) {
//     const institucionesLista = seleccionFiltro.value['institucionEntrada']
//       .split(',')
//       .map((institucion) => institucion.trim())
//       .filter((instituciones) => instituciones.length > 0);
//     // console.log("institucionesLista", institucionesLista);

//     // probar si hay si el arreglo incluye algo de la palabra
//     const institucionesIncluidas = institucionesLista.some((institucion) =>
//       d.keywords.includes(institucion)
//     );
//     // console.log("institucionesIncluidas", institucionesIncluidas);

//     if (institucionesIncluidas) {
//       return 1;
//     } else {
//       return 0;
//     }
//   } else {
//     return 0;
//   }
// }
// const filtrarPorAnio = (d) => {
//   // 2025-07-17T19 // TODO:
//   return d.date !== null &&
//     seleccionFiltro.value['anioEntrada'] &&
//     /* d.date.slice(0, 4) === seleccionFiltro.value["anioEntrada"] // lo siguiente solo válida la fecha con cuatro dígitos*/
//     d.date.slice(0, 13) === seleccionFiltro.value['anioEntrada']
//     ? 1
//     : 0;
// };
// // Para esta función haría falta formatear el input y el título del recursp
// // function filterByKeyword(d) {
// function filtrarPorPalabraClave(d) {
//   if (seleccionFiltro.value['palabrasClaveEntrada']) {
//     const palabrasClaveLista = seleccionFiltro.value['palabrasClaveEntrada']
//       .split(',')
//       .map((palabra) => palabra.trim())
//       .filter((palabra) => palabra.length > 0);
//     // probar si hay si el arreglo incluye algo de la palabra
//     const incluyePalabras = palabrasClaveLista.some((palabraClave) =>
//       d.keywords.includes(palabraClave)
//     );
//     if (incluyePalabras) {
//       return 1;
//     } else {
//       return 0;
//     }
//   } else {
//     return 0;
//   }
// }
// // La idea sería generar un filtro por categoría y, sacar el numero de filtros aplicados y
// // revisar que sumen un total
// // function filterByModal() {
// function filtrarPorModal() {
//   // total de filtros usados
//   let totalFiltros = 0;
//   // resultados ya filtrados
//   const resultados = [];
//   // Revisamos cuántos filtros se aplicaron
//   Object.keys(seleccionFiltro.value).forEach((d) => {
//     if (seleccionFiltro.value[d]) {
//       totalFiltros += 1;
//     }
//   });
//   // console.log("total de filtros usados", totalFiltros);
//   // Revisamos la suma por filtro
//   catalogo.value.forEach((d) => {
//     const tf =
//       filtrarPorCategoria(d) +
//       filtrarPorInstitucion(d) +
//       filtrarPorAnio(d) +
//       filtrarPorPalabraClave(d);
//     // console.log("coincidencias de filtro con el objeto", idx, ":", tf);
//     if (tf === totalFiltros) {
//       resultados.push(d);
//     }
//   });
//   // console.log("Resultado filtrado", resultados);
//   catalogoFiltrado.value = resultados;
//   // actualizar Recursos con lista filtrada en el store
//   resourcesStore.updateFilteredResources(recursosTipo.value, catalogoFiltrado.value);
//   modalFiltros.value.cerrarModal();
// }
function filtrarPorEntrada() {
  // catalogoFiltrado.value = r;
  // resourcesStore.updateFilteredResources(recursosTipo.value, catalogoFiltrado.value);
}
</script>
<template>
  <div class="filtros-avanzados">
    <!-- <ClientOnly>
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
    </ClientOnly> -->

    <div class="flex">
      <div class="columna-8">
        <ClientOnly>
          <SisdaiSelector
            v-model="seleccionOrden"
            etiqueta="Ordenar por"
            @input="emits('alOrdenar', filtro($event.target.value))"
          >
            <option value="fecha_descendente">Recién agregados</option>
            <option value="titulo">Título</option>
            <option value="categoria">Categoría</option>
            <option value="fecha_ascendente">Más antiguo</option>
          </SisdaiSelector>
        </ClientOnly>
      </div>

      <div class="columna-8 flex-vertical-final">
        <div class="flex">
          <div>
            <ClientOnly>
              <label for="buscadoravanzado">Buscador</label>
              <SisdaiCampoBusqueda
                id="buscadoravanzado"
                class="columna-13"
                style="height: 40px"
                :catalogo="catalogo"
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
