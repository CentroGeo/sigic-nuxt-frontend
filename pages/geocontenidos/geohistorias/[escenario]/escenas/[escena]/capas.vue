<script setup>
import { categoriesInSpanish } from '~/utils/consulta';

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { escenario /*, escena*/ } = useRoute().params;

const categoriaSeleccionada = ref(undefined);
const categorias = reactive({
  cargando: false,
  categorias: {},
  cargandoCapas: true,

  // lista: [],
});
async function consultarCategorias() {
  categorias.cargando = true;

  let url = `${config.public.geonodeApi}/categories`;
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.categorias = {
      ...categorias.categorias,
      ...Object.fromEntries(
        data.categories.map(({ identifier, gn_description, fa_class }) => [
          identifier,
          { gn_description, fa_class /*, capas: []*/ },
        ])
      ),
    };

    // categorias.lista.push(
    //   ...data.categories.map(({ /* count,*/ identifier, gn_description, fa_class }) => ({
    //     identifier,
    //     gn_description,
    //     fa_class,
    //   }))
    // );

    url = data.links.next;
  } while (url !== null);

  categoriaSeleccionada.value = Object.keys(categorias.categorias)[0];
  categorias.cargando = false;
}
consultarCategorias();

async function consultar3(identifier) {
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
  categorias.categorias[identifier]['capas'] = [];
  do {
    const respuesta = await gnoxyFetch(url);
    const data = await respuesta.json();

    categorias.categorias[identifier]['capas'].push(
      ...data.resources.map(({ pk, title, alternate }) => ({ pk, title, alternate }))
    );

    url = data.links.next;
  } while (url !== null);

  categorias.cargandoCapas = false;
}
watch(categoriaSeleccionada, consultar3);

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

    <p>Selecciona las capas que deseas agregar a esta escena</p>

    <section class="flex administracion-capas">
      <div class="columna-10">
        <h3>Buscar y Agregar capas</h3>

        <div style="background-color: antiquewhite">Buscador {{ categoriaSeleccionada }}</div>

        <div class="flex">
          <ul class="columna-6 lista-sin-estilo lista-categorias">
            <h4>Categorías</h4>

            <GeocontenidosLoader v-if="categorias.cargando" />

            <li
              v-for="(categoria, identifier) in categorias.categorias"
              v-else
              :key="`categoria-${identifier}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input
                :id="`radio-${identifier}`"
                v-model="categoriaSeleccionada"
                type="radio"
                :value="identifier"
              />
              <label :for="`radio-${identifier}`">
                {{ categoriesInSpanish[categoria.gn_description] }}
              </label>
            </li>
          </ul>

          <ul class="columna-10 lista-sin-estilo lista-capas">
            <h4>Capas</h4>

            <GeocontenidosLoader v-if="categorias.cargandoCapas" />

            <p v-else-if="categorias.categorias[categoriaSeleccionada].capas.length === 0">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>

            <li
              v-for="capa in categorias.categorias[categoriaSeleccionada].capas"
              v-else
              :key="`${capa.pk}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input :id="`checkbox-${capa.pk}`" type="checkbox" :value="capa.pk" />
              <label :for="`checkbox-${capa.pk}`">
                {{ capa.title }}
              </label>
            </li>
          </ul>
        </div>
      </div>

      <div class="columna-6">
        <h3>Capas en esta escena</h3>
        <!-- <GeocontenidosLoader /> -->

        <ul class="lista-sin-estilo lista-capas">
          <li
            v-for="capa in [1, 2, 3]"
            :key="`${capa}`"
            class="fondo-color-acento borde-redondeado-8"
          >
            Nombre de la capa {{ capa }}
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

<script></script>

<style lang="scss" scoped>
.administracion-capas {
  .lista-categorias {
    // height: 60vh;
    // overflow-y: auto;

    label {
      width: 100%;
    }
  }
}
.lista-capas {
  // background-color: cadetblue;

  .elemento-capa {
    margin: 0;
  }
}
</style>
