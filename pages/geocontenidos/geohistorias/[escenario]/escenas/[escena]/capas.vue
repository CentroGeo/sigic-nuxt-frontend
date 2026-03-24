<script setup>
// import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { categoriesNamesInSpanish, wait } from '~/utils/consulta';

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { data: userData } = useAuth();
const { escenario, escena } = useRoute().params;

/**
 * Guarda la información de las categorías y las capas del catalogo
 */
const categorias = reactive({
  cargando: false, // Estado de carga de las categorías
  datos: {}, // Datos del catálogo
  cargandoCapas: true, // Estado de carga de las capas
  seleccion: undefined, // Categoría seleccionada
});

/**
 * Realiza la consulta de las categorías del catalogo
 */
async function consultarCategorias() {
  categorias.cargando = true;

  let url = `${config.public.geonodeApi}/categories`;
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.datos = {
      ...categorias.datos,
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
 * Devuelve el listado de las categorias ordenadas alfabeticamente en español
 */
const categoriasOrdenadas = computed(() =>
  Object.keys(categorias.datos)
    .map((identifier) => [identifier, categoriesNamesInSpanish[identifier]])
    .sort((a, b) => a[1].localeCompare(b[1]))
);

/**
 * Realiza la consulta de las capas de una categoría
 * @param {string} identificador de la categoría
 */
async function consultarCapasEnCategoria(identifier) {
  if (categorias.datos[identifier] !== undefined) return;

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
  categorias.datos[identifier] = {};
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.datos[identifier] = {
      ...categorias.datos[identifier],
      ...Object.fromEntries(
        data.resources.map(({ pk, title, alternate, category }) => [
          pk,
          { title, alternate, category: category.identifier },
        ])
      ),
    };

    url = data.links.next;
  } while (url !== null);

  categorias.cargandoCapas = false;
}
watch(() => categorias.seleccion, consultarCapasEnCategoria);

/**
 * Guarda la información de las capas almacenadas en la escena
 */
const capasEnEscena = reactive({
  capas: [], // Datos de la escena
  cargando: false, // Estado de carga
});

/**
 * Realiza la consulta de las capas almacenadas en la escena
 */
async function consultarCapasEnEscena() {
  capasEnEscena.cargando = true;

  const url = `${config.public.geonodeApi}/scene-layers/by-scene/${escena}/`;
  const respuesta = await gnoxyFetch(url);

  const data = await respuesta.json();
  capasEnEscena.capas = data;
  capasEnEscena.cargando = false;
}
consultarCapasEnEscena();

/**
 * Capas seleccionadas que aún no están almacenadas en la escena
 */
const capasSeleccionadas = ref([]);

/**
 * Capas almacenadas en la escena con formato de selección
 */
const capasEnEscenaSeleccionadas = computed(() =>
  capasEnEscena.capas.map(({ geonode_id }) => `${categorias.seleccion}-${geonode_id}`)
);

/**
 * Capas seleccionadas junto con las almacenadas en la escena para los checkboxs del catálogo
 */
const capasSeleccionadasParaCatalogo = computed({
  get: () => [...capasSeleccionadas.value, ...capasEnEscenaSeleccionadas.value],
  set(nv) {
    capasSeleccionadas.value = nv.filter(
      (categoriaCapa) => !capasEnEscenaSeleccionadas.value.includes(categoriaCapa)
    );
  },
});

/**
 * Capas seleccionadas con formato para visualizar en capas almacenadas (pero que aún no ahn sido almacenadas)
 */
const capasSeleccionadasParaAgregar = computed(() =>
  capasSeleccionadas.value.map((categoriaCapa) => {
    const [identifier, pk] = categoriaCapa.split('-');

    return {
      // scene: Number(escena),
      // geonode_id: Number(pk),
      scene: escena,
      geonode_id: pk,
      visible: true,
      opacity: 1,
      style: null, //
      style_title: null, //

      id: -1, //
      name: categorias.datos[identifier][pk].alternate, //
      dataset_title: categorias.datos[identifier][pk].title, //
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

const modal = reactive({
  cargando: false,
  mensaje: '',
  pictograma: undefined,
  visible: false,
  titulo: '',
});

/**
 *
 */
async function guardarCambios() {
  if (capasSeleccionadas.value.length === 0) return;

  modal.visible = true;
  modal.cargando = true;

  const url = `${config.public.geonodeApi}/scene-layers/bulk-add/${escena}//`;
  const respuesta = await gnoxyFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(capasSeleccionadasParaAgregar.value),
  });

  const datos = await respuesta.json();

  modal.cargando = false;

  if (datos?.success === false) {
    modal.titulo = 'Error';
    modal.pictograma = 'cerrar';
    modal.mensaje = datos.errors.join(` `);
  } else {
    modal.titulo = 'Guardado con éxito';
  }

  await wait(1500);
  modal.visible = false;
  modal.titulo = '';
}
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <GeocontenidosTituloVolver
      :volver="`/geohistorias/${escenario}/escenas`"
      titulo="Agregar capas"
    />

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

            <!-- <p v-else-if="categorias.datos[categorias.seleccion].capas.length === 0"> -->
            <p v-else-if="Object.keys(categorias.datos[categorias.seleccion]).length === 0">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>

            <!-- v-for="capa in categorias.datos[categorias.seleccion].capas" -->
            <li
              v-for="(capa, pk) in categorias.datos[categorias.seleccion]"
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

    <GeocontenidosLoaderModal v-bind="modal" />
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
