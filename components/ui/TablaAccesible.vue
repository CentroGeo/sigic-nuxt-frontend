<script setup>
defineProps({
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
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="(variable, v) in variables"
            :id="`${idAleatorio}-col-${v}`"
            :key="v"
            scope="col"
          >
            {{ variable }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(datum, d) in datos" :id="`${idAleatorio}-ren-${d}`" :key="d">
          <td
            v-for="(variable, v) in variables"
            :key="v"
            :headers="`${idAleatorio}-ren-${d} ${idAleatorio}-col-${v}`"
          >
            {{ datum[variable]?.toLocaleString('en') }}
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
