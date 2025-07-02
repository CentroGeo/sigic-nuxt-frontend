<script setup>
const props = defineProps({
  variables: { type: Array, default: [] },
  datos: { type: Array, default: [] },
  caption: {
    type: String,
    default: "",
  },
});

function generaIdAleatorio() {
  return "id-" + Math.random().toString(36).substring(2);
}
const idAleatorio = generaIdAleatorio();
</script>
<template>
  <table>
    <caption>
      {{
        caption
      }}
    </caption>
    <thead>
      <tr>
        <th
          v-for="(variable, v) in tabla.variables"
          :id="`${idAleatorio}-col-${v}`"
          :key="v"
          scope="col"
        >
          {{ variable.nombre }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(datum, d) in tabla.datos"
        :id="`${idAleatorio}-ren-${d}`"
        :key="d"
      >
        <td
          v-for="(variable, v) in tabla.variables"
          :key="v"
          :headers="`${idAleatorio}-ren-${d} ${idAleatorio}-col-${v}`"
        >
          {{ datum[variable.id]?.toLocaleString("en") }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
