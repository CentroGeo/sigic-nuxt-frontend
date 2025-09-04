<script setup>
/**
 * @typedef {Object} Props
 * @property {Array} [variables=[]] - Indica las variables del encabezado thead tr th.
 * @property {Array} [datos=[]] - Indica los datos que coincida con las variables.
 * @property {caption} [caption=''] - Indica el título de la tabla.
 */

/** @type {Props} */
const props = defineProps({
  variables: { type: Array, default: Array },
  datos: { type: Array, default: Array },
  caption: {
    type: String,
    default: '',
  },
});

function generaIdAleatorio() {
  return 'id-' + Math.random().toString(36).substring(2);
}
const idAleatorio = generaIdAleatorio();

function IrARuta(objeto) {
  // Función para codificar un objeto que se va a pasar
  // al navegar a otra vista

  // evitar problemas con espacios con JSON.stingify
  const pk = encodeURIComponent(JSON.stringify({ pk: objeto.pk }));

  if (objeto.tipo_recurso === 'Capa geográfica') {
    navigateTo({
      path: '/catalogo/mis-archivos/editar-estilo',
      query: { data: pk },
    });
  }

  if (objeto.tipo_recurso === 'Datos tabulados') {
    navigateTo({
      path: '/catalogo/mis-archivos/unir-vectores',
      query: { data: pk },
    });
  }

  if (objeto.tipo_recurso === 'Documentos') {
    navigateTo({
      path: '/catalogo/mis-archivos/editar-metadatos',
      query: { data: pk },
    });
  }
}
</script>
<template>
  <div class="contenedor-tabla p-2">
    <table>
      <caption>
        {{
          props.caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="(variable, v) in props.variables"
            :id="`${idAleatorio}-col-${v}`"
            :key="v"
            scope="col"
          >
            {{ variable.replaceAll('_', ' ') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(datum, d) in props.datos" :id="`${idAleatorio}-ren-${d}`" :key="d">
          <td
            v-for="(variable, v) in props.variables"
            :key="v"
            :headers="`${idAleatorio}-ren-${d} ${idAleatorio}-col-${v}`"
          >
            {{
              variable !== 'tipo_recurso' && variable !== 'acciones'
                ? datum[variable]?.toLocaleString('en')
                : ''
            }}
            <p
              v-if="variable === 'tipo_recurso'"
              class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-16"
              style="width: max-content"
            >
              <span v-if="datum[variable]?.toLocaleString('en') === 'Documentos'"
                >{{ datum[variable]?.toLocaleString('en') }}
                <span class="pictograma-documento"></span>
              </span>

              <span v-if="datum[variable]?.toLocaleString('en') === 'Datos tabulados'">
                {{ datum[variable]?.toLocaleString('en') }}
                <span class="pictograma-tabla" />
              </span>

              <span v-if="datum[variable]?.toLocaleString('en') === 'Capa geográfica'">
                {{ datum[variable]?.toLocaleString('en') }}
                <span class="pictograma-capas" />
              </span>
            </p>

            <div v-if="variable === 'acciones'">
              <div v-if="datum[variable] === 'Editar, Ver, Descargar, Remover'" class="flex-width">
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Editar metadatos"
                  type="button"
                  @click="IrARuta(datum)"
                >
                  <span class="pictograma-editar"></span>
                </button>
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Ver en visualizador"
                  type="button"
                >
                  <span class="pictograma-previsualizar"></span>
                </button>
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Publicar en catálogo"
                  type="button"
                >
                  <span class="pictograma-ayuda"></span>
                </button>
                <a
                  class="boton-pictograma boton-secundario"
                  aria-label="Descargar archivo"
                  type="button"
                  :href="datum['enlace_descarga']"
                >
                  <span class="pictograma-archivo-descargar"></span>
                </a>
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Remover archivo"
                  type="button"
                >
                  <span class="pictograma-eliminar"></span>
                </button>
              </div>
              <div v-if="datum[variable] === 'Ver, Descargar'" class="flex-width">
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Ver en visualizador"
                  type="button"
                >
                  <span class="pictograma-previsualizar"></span>
                </button>
                <a
                  class="boton-pictograma boton-secundario"
                  aria-label="Descargar archivo"
                  type="button"
                  :href="datum['enlace_descarga']"
                >
                  <span class="pictograma-archivo-descargar"></span>
                </a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="scss" scoped>
.contenedor-tabla {
  overflow: auto;
  display: inline-grid;
}
table {
  min-width: 600px;
  .flex-width {
    display: flex;
    gap: 16px;
    max-width: 224px;
  }
}
</style>
