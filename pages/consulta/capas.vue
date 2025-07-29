<script setup>
import {
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from "@centrogeomx/sisdai-mapas";
import { exportarMapa as exportarMapaPNG } from "@centrogeomx/sisdai-mapas/src/utiles";

const resourceType = "dataLayer";

const extensionNacional = "-118.3651,14.5321,-86.7104,32.7187";
const storeConsulta = useConsultaStore();
const extensionMapa = computed(
  () => storeConsulta.ajustarExtensionMapa || extensionNacional
);

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();
const randomNum = ref(0);
const isFinishedLoading = ref(0);

const linkExportaMapa = ref();
function exportarMapa() {
  exportarMapaPNG(
    document.querySelectorAll(".mapa .ol-viewport").item(0),
    linkExportaMapa.value
  );
}

const attributos = reactive({});
function addAttribute(pk) {
  // attributes[pk] = `${config.public.geonodeApi}/datasets/${pk}/attribute_set`;
  attributos[pk] = [];

  fetch(`${config.public.geonodeApi}/datasets/${pk}/attribute_set`)
    .then((response) => response.json())
    .then(({ attributes }) => {
      // console.log(attributes);

      const etiquetas = {};
      const columnas = attributes
        .filter((a) => a.visible)
        .sort((a, b) => a.display_order - b.display_order)
        .map(({ attribute, attribute_label }) => {
          etiquetas[attribute] = attribute_label || attribute;
          return attribute;
        });
      //console.log(columnas);

      attributos[pk] = {
        params: {
          propertyName: columnas.join(","),
        },
        // attribute_label
        contenido: (data) =>
          columnas
            .map(
              (columna) =>
                `<p><b>${etiquetas[columna] || columna}</b>: ${
                  data[columna]
                }</p>`
            )
            .join(""),
      };
      //console.log(attributos[pk]);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      //console.log("fin");
    });
}

watch(
  () => storeSelected.selectedResources[resourceType],
  (nv_) => {
    randomNum.value += Math.random();

    const arr1 = nv_.map((r) => r.pk);
    const arr2 = Object.keys(attributos);
    // console.log(arr1, arr2);

    const nv = arr1.filter((item) => !arr2.includes(item));
    // console.log("Se agregó:", nv);
    nv.forEach((r) => addAttribute(r));

    const ov = arr2.filter((item) => !arr1.includes(item));
    // console.log("Se quitó:", ov);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    ov.forEach((resource) => delete attributos[resource]);

    // console.log(attributos);

    //console.log();
  },
  { deep: true }
);

// bbox_polygon
// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate

function cuadroInformativo(pk) {
  console.log(pk);

  return {
    params: {
      propertyName: "nombre",
    },
    contenido: (d) => `<p><b>nombre</b>: ${d["nombre"]}</p>`,
  };
}
// Este watcher sirve para ajustar los índices de las capas montadas
// cuando estas terminan de cargarse
watch(isFinishedLoading, () => {
  if (
    isFinishedLoading.value ===
    storeSelected.selectedResources[resourceType].length
  ) {
    storeSelected.lowerIndex(
      storeSelected.selectedResources[resourceType][0],
      resourceType
    );
    storeSelected.raiseIndex(
      storeSelected.selectedResources[resourceType][1],
      resourceType
    );
  }
});
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Capas geográficas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>

    <template #visualizador>
      <ClientOnly>
        <SisdaiMapa
          class="gema"
          :vista="{ extension: extensionMapa }"
          @click-centrar="storeConsulta.ajustarExtensionMapa = undefined"
        >
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            v-for="(capa, index) in storeSelected.selectedResources[
              resourceType
            ]"
            :key="`${capa.uuid}_${randomNum}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
            :posicion="storeSelected.selectedResources.length - index"
            :cuadro-informativo="attributos[capa.pk]"
            @alFinalizarCarga="isFinishedLoading += 1"
          />
        </SisdaiMapa>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
        :funcion-descarga="exportarMapa"
      />
      <a ref="linkExportaMapa" class="oculto" download="sigic.png" />
    </template>
  </ConsultaLayoutPaneles>
</template>
