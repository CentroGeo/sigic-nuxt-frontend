<script setup>
import {
  SisdaiMapa,
  SisdaiCapaXyz,
  SisdaiCapaWms,
} from "@centrogeomx/sisdai-mapas";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import SisdaiMenuLateral from "@centrogeomx/sisdai-componentes/src/componentes/menu-lateral/SisdaiMenuLateral.vue";
import { ref } from "vue";
import { useSelectedResourcesStore } from "~/stores/selectedResources.js";
import { useGeonodeResources } from "~/composables/useGeonodeResources";
//import { urlParams } from "./utils";

const resourcesStore = useSelectedResourcesStore();
const resourceType = ref("dataset");

const { resourcesList, pending, error, refetch } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 1000,
  resourceType: resourceType.value,
});

function setResourceType(valor) {
  resourceType.value = valor;
  //console.log("setResource: ", resourceType.value);
  // Faltaría re trigerear el llamado de datos
  refetch({
    newNum: 1,
    newSize: 1000,
    newType: resourceType.value,
  });
}
</script>

<template>
  <main class="modulo-consulta grid">
    <div class="columna-3">
      <div class="menu-lateral">
        <SisdaiMenuLateral>
          <template #contenido-menu-lateral>
            <ul>
              <li>
                <button @click="setResourceType('dataset')">Capas</button>
              </li>
              <li><button>Tablas</button></li>
              <li>
                <button @click="setResourceType('document')">PDFs</button>
              </li>
            </ul>
          </template>
        </SisdaiMenuLateral>
      </div>
      <div>
        <h2>{{ resourceType }}</h2>
        <SisdaiCampoBusqueda class="p-3" />
        <ul>
          <li v-for="r in resourcesList" :key="r.uuid">
            <button @click="resourcesStore.addResource(resourceType, r)">
              {{ r.title }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- <div class="columna-10 texto-centrado borde-x">Previsualización</div> -->
    <client-only>
      <SisdaiMapa
        class="columna-10"
        descripcion="Mapa básico con una capa base visible a nivel mundial."
      >
        <SisdaiCapaXyz />
        <SisdaiCapaWms
          v-for="capa in resourcesStore.selectedResources['dataset']"
          :key="capa.uuid"
          fuente="https://geonode.dev.geoint.mx/geoserver/ows"
          :capa="capa.alternate"
        />
      </SisdaiMapa>
    </client-only>

    <div class="columna-3 texto-centrado">
      <p>Elementos seleccionados</p>
      <div
        v-for="r in resourcesStore.selectedResources[resourceType]"
        :key="r.uuid"
        class="capas-seleccionadas"
      >
        <p>
          {{ r.title }}
        </p>
        <button @click="resourcesStore.removeResource(resourceType, r)">
          Borrar
        </button>
      </div>
    </div>
  </main>
</template>

<style lang="scss">
ul {
  list-style-type: none;
}
.modulo-consulta {
  &.grid {
    gap: 0;
    // grid-template-columns: repeat(12, 1fr);
  }
}
.capas-seleccionadas {
  background-color: #d0d0d7;
  margin: 10px;
  padding: 3px;
}

.menu-lateral {
  height: 200px;
}
</style>
