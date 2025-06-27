<script setup>
import LayoutConsulta from "~/components/consulta/LayoutConsulta.vue";
import PanelCatalogo from "~/components/consulta/PanelCatalogo.vue";
import PanelSeleccion from "~/components/consulta/PanelSeleccion.vue";

import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";

import {
  SisdaiMapa,
  SisdaiCapaXyz,
  SisdaiCapaWms,
} from "@centrogeomx/sisdai-mapas";

import { useSelectedResourcesStore } from "~/stores/selectedResources.js";
import { useGeonodeResources } from "~/composables/useGeonodeResources";
// import { urlParams } from "./utils";

const resourceType = ref("dataset");
const { resourcesList, refetch } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 1000,
  resourceType: resourceType.value,
});
const resourcesStore = useSelectedResourcesStore();
// function setResourceType(valor) {
//   resourceType.value = valor;
//   refetch({
//     pageNumber: 1,
//     pageSize: 1000,
//     resourceType: resourceType.value,
//   });
// }
</script>

<template>
  <LayoutConsulta>
    <div class="visualizacion-capas">
      <PanelCatalogo>
        <h3>{{ resourceType }}</h3>
        <SisdaiCampoBusqueda class="p-3" />
        <ul>
          <li v-for="r in resourcesList" :key="r.uuid">
            <button @click="resourcesStore.addResource(resourceType, r)">
              {{ r.title }}
            </button>
          </li>
        </ul>
      </PanelCatalogo>

      <client-only>
        <SisdaiMapa
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

      <PanelSeleccion>
        <h3>Elementos seleccionados</h3>
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
      </PanelSeleccion>
    </div>
  </LayoutConsulta>
</template>

<style lang="scss">
.visualizacion-capas {
  width: 100%;
  display: flex;
}
</style>
