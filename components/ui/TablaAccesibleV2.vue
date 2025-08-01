<script setup>
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
            <!-- <p
              v-if="variable === 'tipo_recurso'"
              class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-16"
              style="min-width: 168px"
            >
              {{ datum[variable]?.toLocaleString("en") }}
              <span class="pictograma-capas"></span>
            </p> -->
            <p
              v-if="variable === 'tipo_recurso'"
              class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-16"
              style="min-width: 168px"
            >
              <span v-if="datum[variable]?.toLocaleString('en') === 'document'"
                >{{ datum[variable]?.toLocaleString('en') }}
                <span class="pictograma-documento"></span>
              </span>
              <span
                v-if="
                  datum[variable]?.toLocaleString('en') === 'dataset' ||
                  datum[variable]?.toLocaleString('en') === 'Capa geográfica'
                "
                >{{ datum[variable]?.toLocaleString('en') }}
                <span class="pictograma-capas"></span>
              </span>
            </p>

            <div v-if="variable === 'acciones'">
              <div
                v-if="datum[variable]?.includes('Editar, Descargar, Remover')"
                style="display: flex; gap: 16px; max-width: 168px"
              >
                <button class="boton-pictograma boton-secundario" aria-label="" type="button">
                  <span class="pictograma-editar"></span>
                </button>
                <button class="boton-pictograma boton-secundario" aria-label="" type="button">
                  <span class="pictograma-archivo-descargar"></span>
                </button>
                <button class="boton-pictograma boton-secundario" aria-label="" type="button">
                  <span class="pictograma-eliminar"></span>
                </button>
              </div>
              <div
                v-if="datum[variable]?.includes('Ver, Descargar')"
                style="display: flex; gap: 16px; max-width: 168px"
              >
                <button class="boton-pictograma boton-secundario" aria-label="" type="button">
                  <span class="pictograma-ayuda"></span>
                </button>
                <button class="boton-pictograma boton-secundario" aria-label="" type="button">
                  <span class="pictograma-archivo-descargar"></span>
                </button>
              </div>
            </div>
            <!-- {{ datum[variable]?.toLocaleString("en") }} -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="scss">
.contenedor-tabla {
  overflow: auto;
  display: inline-grid;
}
table {
  min-width: 600px;
}
</style>
