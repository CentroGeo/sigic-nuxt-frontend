<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { categoriesNamesInSpanish } from '~/utils/consulta';

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { escenario, escena } = useRoute().params;

/**
 *
 */
const categoriasOrdenadas = computed(() =>
  Object.keys(categorias.categorias)
    .map((identifier) => [identifier, categoriesNamesInSpanish[identifier]])
    .sort((a, b) => a[1].localeCompare(b[1]))
);

/**
 *
 */
const categorias = reactive({
  cargando: false,
  categorias: {},
  cargandoCapas: true,
  seleccion: undefined,
});

/**
 *
 */
async function consultarCategorias() {
  categorias.cargando = true;

  let url = `${config.public.geonodeApi}/categories`;
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.categorias = {
      ...categorias.categorias,
      ...Object.fromEntries(
        // data.categories.map(({ identifier, fa_class }) => [identifier, { fa_class }])
        data.categories.map(({ identifier }) => [identifier, undefined])
      ),
    };

    url = data.links.next;
  } while (url !== null);

  categorias.seleccion = categoriasOrdenadas.value[0][0];
  categorias.cargando = false;
}
consultarCategorias();

/**
 *
 * @param identifier
 */
async function consultarCapasEnCategoria(identifier) {
  // if (Object.prototype.hasOwnProperty.call(categorias.categorias[identifier], 'capas')) return;
  if (categorias.categorias[identifier] !== undefined) return;

  categorias.cargandoCapas = true;

  const params = {
    'filter{resource_type.in}': 'dataset',
    'filter{has_geometry}': true,
    'sort[]': '-last_updated',
    'filter{category.identifier.in}': identifier,
    // 'filter{complete_metadata}': true,
    // page_size: 1,
  };

  let url = `${config.public.geonodeApi}/sigic-resources?${new URLSearchParams(params).toString()}`;
  // categorias.categorias[identifier]['capas'] = [];
  categorias.categorias[identifier] = {};
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.categorias[identifier] = {
      ...categorias.categorias[identifier],
      ...Object.fromEntries(
        data.resources.map(({ pk, title, alternate, category }) => [
          pk,
          { title, alternate, category: category.identifier },
        ])
      ),
    };

    // console.log(toRaw(categorias.categorias[identifier]));

    // categorias.categorias[identifier]['capas'].push(
    //   ...data.resources.map(({ pk, title, alternate, category }) => ({
    //     pk,
    //     title,
    //     alternate,
    //     category,
    //   }))
    // );

    url = data.links.next;
  } while (url !== null);

  categorias.cargandoCapas = false;
}
watch(() => categorias.seleccion, consultarCapasEnCategoria);

/**
 *
 */
const capasEnEscena = reactive({
  capas: [],
  cargando: false,
});

/**
 *
 */
async function consultarCapasEnEscena() {
  capasEnEscena.cargando = true;

  const url = `${config.public.geonodeApi}/scene-layers/by-scene/${escena}/`;
  const respuesta = await gnoxyFetch(url);

  const data = await respuesta.json();
  capasEnEscena.capas = data;
  // console.log('consultarCapasEnEscena', toRaw(capasEnEscena.capas));

  capasEnEscena.cargando = false;
}
consultarCapasEnEscena();

/**
 * Capas seleccionadas que no están guardadas en la escena
 */
const capasSeleccionadas = ref([]);

/**
 *
 */
const capasEnEscenaSeleccionadas = computed(() =>
  capasEnEscena.capas.map(({ geonode_id }) => `${categorias.seleccion}-${geonode_id}`)
);

/**
 * Capas seleccionadas junto con las guardadas en la escena para el catálogo
 */
const capasSeleccionadasParaCatalogo = computed({
  get: () => [...capasSeleccionadas.value, ...capasEnEscenaSeleccionadas.value],
  set(nv) {
    capasSeleccionadas.value = nv.filter(
      (categoriaCapa) => !capasEnEscenaSeleccionadas.value.includes(categoriaCapa)
    );
  },
});

const capasSeleccionadasParaAgregar = computed(() =>
  capasSeleccionadas.value.map((categoriaCapa) => {
    const [identifier, pk] = categoriaCapa.split('-');

    return {
      scene: escena,
      geonode_id: pk,
      visible: true,
      opacity: 1,
      style: null, //
      style_title: null, //

      id: -1, //
      name: categorias.categorias[identifier][pk].alternate, //
      dataset_title: categorias.categorias[identifier][pk].title, //
      stack_order: -1, //
    };
  })
);

// {
//   "scene": 1,
//   "geonode_id": 2,
//   "visible": true,
//   "opacity": 0.8
//
//   "style": "estilo_rojo",
//   "style_title": "Estilo Rojo",
// }

/**
 *
 */
function guardarCambios() {
  // console.log(params);
}
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <GeocontenidosTituloVolver
      :volver="`/geohistorias/${escenario}/escenas`"
      titulo="Agregar capas"
    />

    <p class="m-0">Selecciona las capas que deseas agregar a esta escena</p>

    <section class="flex administracion-capas">
      <div class="columna-10">
        <h3>Buscar y Agregar capas</h3>

        <div style="background-color: antiquewhite">Buscador {{ categorias.seleccion }}</div>

        <div class="flex">
          <ul class="columna-6 lista-sin-estilo lista-categorias">
            <h4>Categorías</h4>

            <GeocontenidosLoader v-if="categorias.cargando" />

            <li
              v-for="[identifier, nombre] in categoriasOrdenadas"
              v-else
              :key="`categoria-${identifier}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input
                :id="`radio-${identifier}`"
                v-model="categorias.seleccion"
                type="radio"
                :value="identifier"
              />
              <label :for="`radio-${identifier}`">{{ nombre }}</label>
            </li>
          </ul>

          <ul class="columna-10 lista-sin-estilo lista-capas">
            <h4>Capas</h4>

            <GeocontenidosLoader v-if="categorias.cargandoCapas" />

            <!-- <p v-else-if="categorias.categorias[categorias.seleccion].capas.length === 0"> -->
            <p v-else-if="Object.keys(categorias.categorias[categorias.seleccion]).length === 0">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>

            <!-- v-for="capa in categorias.categorias[categorias.seleccion].capas" -->
            <li
              v-for="(capa, pk) in categorias.categorias[categorias.seleccion]"
              v-else
              :key="`checkbox-capa-catalogo-${pk}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input
                :id="`checkbox-capa-catalogo-${pk}`"
                v-model="capasSeleccionadasParaCatalogo"
                type="checkbox"
                :value="`${capa.category}-${pk}`"
                :disabled="capasEnEscenaSeleccionadas.includes(`${capa.category}-${pk}`)"
              />
              <!-- :value="Number(pk)" -->
              <label :for="`checkbox-capa-catalogo-${pk}`">
                {{ capa.title }} ({{ `${capa.category}-${pk}` }})
              </label>
            </li>
          </ul>
        </div>
      </div>

      <div class="columna-6">
        <h3>Capas en esta escena</h3>

        <ul class="lista-sin-estilo lista-capas">
          <GeocontenidosLoader v-if="capasEnEscena.cargando" />

          <p v-else-if="capasEnEscena.capas.length === 0">
            No se encontraron resultados que coincidan con la búsqueda.
          </p>

          <li
            v-for="capa in [...capasEnEscena.capas, ...capasSeleccionadasParaAgregar]"
            v-else
            :key="`${capa}`"
            class="fondo-color-acento borde-redondeado-8 p-2"
          >
            <SisdaiLeyendaWms
              :fuente="`${config.public.geoserverUrl}/wms`"
              :nombre="capa.name"
              :titulo="capa.dataset_title"
              :sin-control="true"
            />
            <!-- 
                :titulo="capa.dataset_title || 'cargando...'"
                :fuente="findServer(resourceElement).replace('?', '')"
                :consulta="gnoxyFetch"
                :estilo="selectedStyle"
                :sin-control-clases="true"
              -->

            <fieldset class="m-t-1 m-b-2">
              <label for="estilo">Estilo</label>
              <select id="estilo">
                <option value="">Estilo 1</option>
              </select>
            </fieldset>

            <div class="flex flex-contenido-final">
              <button class="boton-pictograma boton-sin-contenedor-secundario">
                <span class="pictograma-eliminar" />
              </button>
              <button class="boton-pictograma boton-sin-contenedor-secundario">
                <span class="pictograma-editar" />
              </button>
              <button class="boton-pictograma boton-sin-contenedor-secundario">
                <span class="pictograma-subir-capa" />
              </button>
              <button class="boton-pictograma boton-sin-contenedor-secundario">
                <span class="pictograma-bajar-capa" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!--  -->
    <section class="flex flex-contenido-final">
      <NuxtLink
        :to="`/geocontenidos/geohistorias/${escenario}/escenas`"
        class="boton boton-secundario"
      >
        Volver
      </NuxtLink>

      <input type="submit" class="boton-primario" value="Guardar" />
    </section>
    <!--  -->
  </form>
</template>

<style lang="scss" scoped>
.administracion-capas {
  .lista-categorias,
  .lista-capas {
    label {
      width: 100%;
    }
  }
}
</style>
