<script setup>
import { SisdaiMapa, SisdaiCapaXyz } from "@centrogeomx/sisdai-mapas";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";
import { urlParams } from "./utils";

const { VITE_GEONODE_API, VITE_GEONODE_URL } = import.meta.env
const api = `${VITE_GEONODE_URL}${VITE_GEONODE_API}/resources`
const options = { method: 'GET' }

const resourcesList = ref([])
fetch(
  urlParams(api, {
    page: 1,
    // page_size: 1000,
    // 'filter{resource_type}': 'dataset',
    // 'filter{group.name}': 'dgpdi',
    // 'filter{category.identifier}': identifier,
  }),
  options,
)
  .then((response) => {
    if (response.ok) return response.json()

    return { resources: [] }
  })
  .then(({ resources }) => {
    if (resources.length === 0) return

    resourcesList.value = resources
  })
  .catch((err) => {
    console.error(err)
  })
  .finally(() => {
    // console.log('fin')
  })
</script>

<template>
  <main class="modulo-consulta grid">
    <div class="columna-3">
      <SisdaiCampoBusqueda class="p-3" />

      <ul>
        <li v-for="r in resourcesList" :key="r.pk">
          {{ r.title }}
        </li>
      </ul>
    </div>

    <!-- <div class="columna-10 texto-centrado borde-x">Previsualización</div> -->
    <client-only>
      <SisdaiMapa
        class="columna-10"
        descripcion="Mapa básico con una capa base visible a nivel mundial."
      >
        <!-- <SisdaiCapaXyz fuente="https://www.mapabase.atdt.gob.mx/styles/default/{z}/{x}/{y}" /> -->
        <SisdaiCapaXyz />
      </SisdaiMapa>
    </client-only>

    <div class="columna-3 texto-centrado">
      <p>Elementos seleccionados</p>
    </div>
  </main>
</template>

<style lang="scss">
.modulo-consulta {
  &.grid {
    gap: 0;
    // grid-template-columns: repeat(12, 1fr);
  }
}
</style>