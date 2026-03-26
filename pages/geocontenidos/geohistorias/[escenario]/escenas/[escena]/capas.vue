<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';
import { valoresPorDefecto as valoresModal } from '~/components/geocontenidos/loaderModal.vue';
import { wait } from '~/utils/consulta';
import { GestionCapas } from '~/utils/geocontenidos/GestionCapas';

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { data: userData } = useAuth();
const { escenario, escena } = useRoute().params;

/**
 * Guarda la información de las categorías y las capas del catalogo
 */
const categorias = reactive({
  cargando: false, // Estado de carga de las categorías
  cargandoCapas: true, // Estado de carga de las capas
});

const gCapas = reactive(new GestionCapas());

/**
 * Realiza la consulta de las categorías del catalogo
 */
async function consultarCategorias() {
  categorias.cargando = true;

  let url = `${config.public.geonodeApi}/categories`;
  do {
    const respuesta = await gnoxyFetch(url);
    const datos = await respuesta.json();

    gCapas.categorias = {
      ...gCapas.categorias,
      ...Object.fromEntries(datos.categories.map(({ identifier }) => [identifier, undefined])),
    };

    url = datos.links.next;
  } while (url !== null);

  gCapas.categoria = gCapas.categoriasOrdenadas[0][0];
  categorias.cargando = false;
}
consultarCategorias();

/**
 * Realiza la consulta de las capas de una categoría
 * @param {string} identificador de la categoría
 */
async function consultarCapasEnCategoria(identifier) {
  if (gCapas.categorias[identifier] !== undefined) return;

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
  gCapas.categorias[identifier] = {};
  do {
    const respuesta = await gnoxyFetch(url);
    const datos = await respuesta.json();

    gCapas.categorias[identifier] = {
      ...gCapas.categorias[identifier],
      ...Object.fromEntries(
        datos.resources.map(({ pk, title, alternate, category }) => [
          pk,
          { title, alternate, category: category.identifier },
        ])
      ),
    };

    url = datos.links.next;
  } while (url !== null);

  categorias.cargandoCapas = false;
}
watch(() => gCapas.categoria, consultarCapasEnCategoria);

/**
 * Guarda la información de las capas almacenadas en la escena
 */
const capasAlmacenadas = reactive({
  cargando: false, // Estado de carga
});

/**
 * Realiza la consulta de las capas almacenadas en la escena
 */
async function consultarCapasAlmacenadas() {
  capasAlmacenadas.cargando = true;

  const url = `${config.public.geonodeApi}/scene-layers/by-scene/${escena}/`;
  const respuesta = await gnoxyFetch(url);

  const datos = await respuesta.json();
  gCapas.almacenadas = datos;
  capasAlmacenadas.cargando = false;
}
consultarCapasAlmacenadas();

const modal = reactive({ ...valoresModal });

/**
 *
 */
async function almacenarCapas() {
  modal.mensaje = 'Almacenando capas';
  const url = `${config.public.geonodeApi}/scene-layers/bulk-add/${escena}//`;
  const respuesta = await gnoxyFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(gCapas.almacenar),
  });

  return await respuesta.json();
}

async function actualizarCapa(capa) {
  modal.mensaje = 'Actualizando capas';
  const url = `${config.public.geonodeApi}/scene-layers/${capa.id}//`;
  const respuesta = await gnoxyFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify({ ...capa }),
  });

  return await respuesta.json();
}

async function eliminarCapas() {
  modal.mensaje = 'Eliminando capas';
  const url = `${config.public.geonodeApi}/scene-layers/bulk-delete/${escena}//`;
  const respuesta = await gnoxyFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(gCapas.eliminar),
  });

  return await respuesta.json();
}

function mostrarError({ errors }) {
  modal.cargando = false;
  modal.titulo = 'Error';
  modal.pictograma = 'cerrar';
  modal.mensaje = errors.join(` `);
  modal.permitirCerrar = true;
}

async function guardarCambios() {
  modal.visible = true;
  modal.cargando = true;

  if (gCapas.eliminar.length > 0) {
    const datos = await eliminarCapas();
    if (datos?.success === false) {
      mostrarError(datos);
      return;
    }
  }

  for await (const capa of gCapas.actualizar) {
    const datos = await actualizarCapa(capa);
    if (datos?.success === false) {
      mostrarError(datos);
      return;
    }
  }

  if (gCapas.seleccionNoAlmacenadas.length > 0) {
    const datos = await almacenarCapas();
    if (datos?.success === false) {
      mostrarError(datos);
      return;
    }
  }

  modal.titulo = 'Guardado con éxito';
  modal.cargando = false;
  modal.mensaje = '';
  await wait(1500);
  reloadNuxtApp();
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

      <button class="boton-secundario" :disabled="!gCapas.hayCambios">Restablecer</button>

      <input type="submit" class="boton-primario" value="Guardar" :disabled="!gCapas.hayCambios" />
    </section>
    <!--  -->

    <!-- <hr />
    almacenadas: {{ gCapas.almacenadas_ }}
    <hr />
    seleccionAlmacenadas: {{ gCapas.seleccionAlmacenadas }}
    <hr />
    seleccionNoAlmacenadas: {{ gCapas.seleccionNoAlmacenadas }}
    <hr />
    seleccion: {{ gCapas.seleccion }}
    <hr />
    <b>almacenar:</b> {{ gCapas.almacenar }}
    <hr />
    <b>actualizar:</b> {{ gCapas.actualizar }}
    <hr />
    <b>eliminar:</b> {{ gCapas.eliminar }}
    <hr />
    eliminarSeleccion: {{ gCapas.eliminarSeleccion }}
    <hr /> -->

    <p class="m-0">Selecciona las capas que deseas agregar a esta escena</p>

    <section class="flex administracion-capas">
      <div class="columna-10">
        <h3>Buscar y Agregar capas</h3>

        <div style="background-color: antiquewhite">Buscador {{ gCapas.categoria }}</div>

        <div class="flex">
          <ul class="columna-6 lista-sin-estilo lista-categorias">
            <h4>Categorías</h4>

            <GeocontenidosLoader v-if="categorias.cargando" />

            <li
              v-for="[identifier, nombre] in gCapas.categoriasOrdenadas"
              v-else
              :key="`categoria-${identifier}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input
                :id="`radio-${identifier}`"
                v-model="gCapas.categoria"
                type="radio"
                :value="identifier"
              />
              <label :for="`radio-${identifier}`">{{ nombre }}</label>
            </li>
          </ul>

          <ul class="columna-10 lista-sin-estilo lista-capas">
            <h4>Capas</h4>

            <GeocontenidosLoader v-if="categorias.cargandoCapas" />

            <p v-else-if="Object.keys(gCapas.categorias[gCapas.categoria]).length === 0">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>

            <li
              v-for="(capa, pk) in gCapas.categorias[gCapas.categoria]"
              v-else
              :key="`checkbox-capa-catalogo-${pk}`"
              class="fondo-color-acento borde-redondeado-8"
            >
              <input
                :id="`checkbox-capa-catalogo-${pk}`"
                v-model="gCapas.seleccion"
                type="checkbox"
                :value="`${capa.category}-${pk}`"
                :disabled="gCapas.seleccionAlmacenadas.includes(`${gCapas.categoria}-${pk}`)"
              />
              <label :for="`checkbox-capa-catalogo-${pk}`">
                {{ capa.title }}
              </label>
            </li>
          </ul>
        </div>
      </div>

      <div class="columna-6">
        <h3>Capas en esta escena</h3>

        <ul class="lista-sin-estilo lista-capas">
          <GeocontenidosLoader v-if="capasAlmacenadas.cargando" />

          <p v-else-if="gCapas.comoAlmacenadas.length === 0">
            No se encontraron resultados que coincidan con la búsqueda.
          </p>

          <li
            v-for="capa in gCapas.comoAlmacenadas"
            v-else
            :key="`capa-${capa.id}`"
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

            <!-- <fieldset class="m-t-1 m-b-2">
              <label for="estilo">Estilo</label>
              <select id="estilo">
                <option value="">Estilo 1</option>
              </select>
            </fieldset> -->

            <div class="flex flex-contenido-final">
              <button
                aria-label="Eliminar selección"
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
                @click="gCapas.asociaElimimar(capa)"
              >
                <span class="pictograma-eliminar" aria-hidden="true" />
              </button>

              <button
                aria-label="Mostrar"
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
                @click="capa.visible = !capa.visible"
              >
                <span
                  :class="`pictograma-ojo-${capa.visible ? 'ver' : 'ocultar'}`"
                  aria-hidden="true"
                />
              </button>

              <button
                aria-label=""
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
              >
                <span class="pictograma-editar" aria-hidden="true" />
              </button>
              <button
                aria-label=""
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
              >
                <span class="pictograma-subir-capa" aria-hidden="true" />
              </button>
              <button
                aria-label=""
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
              >
                <span class="pictograma-bajar-capa" aria-hidden="true" />
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
