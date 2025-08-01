<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { exportarHTMLComoPNG as exportarMapaPNG } from '@centrogeomx/sisdai-mapas/funciones';

const resourceType = 'dataLayer';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';
const storeConsulta = useConsultaStore();
const extensionMapa = computed(() => storeConsulta.ajustarExtensionMapa || extensionNacional);

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();
const randomNum = ref(0);
const isFinishedLoading = ref(0);
const linkExportaMapa = ref();
function exportarMapa() {
  exportarMapaPNG(document.querySelectorAll('.mapa .ol-viewport').item(0), linkExportaMapa.value);
}
const attributos = reactive({});
async function addAttribute(pk) {
  // attributes[pk] = `${config.public.geonodeApi}/datasets/${pk}/attribute_set`;
  attributos[pk] = [];

  await fetch(`${config.public.geonodeApi}/datasets/${pk}/attribute_set`)
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

      attributos[pk] = {
        params: {
          propertyName: columnas.join(','),
        },
        // attribute_label
        contenido: (data) =>
          columnas
            .map((columna) => `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`)
            .join(''),
      };
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

    //const ov = arr2.filter((item) => !arr1.includes(item));
    // console.log("Se quitó:", ov);

    //ov.forEach((resource) => delete attributos[resource]);

    // console.log(attributos);

    //console.log();
  },
  { deep: true }
);

// bbox_polygon
// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate

/** * Revisión!
 */

function cuadroInformativo(pk) {
  console.log(pk);

  return {
    params: {
      propertyName: 'nombre',
    },
    contenido: (d) => `<p><b>nombre</b>: ${d['nombre']}</p>`,
  };
} 
function updateMapParams(centro, acercamiento) {
  storeSelected.setMapViewParams(centro, acercamiento);
}

// Este watcher sirve para ajustar los índices de las capas montadas
// cuando estas terminan de cargarse pero solo funciona cuando recién se montan las capas.
watch(isFinishedLoading, () => {
  console.log("cuenta: ", isFinishedLoading.value);
  let resourcesNum = storeSelected.selectedResources[resourceType].length;
  if (resourcesNum === isFinishedLoading.value) {
    randomNum.value += 1;
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
          :vista="{
            extension: extensionMapa,
          }"
          @click-centrar="storeConsulta.ajustarExtensionMapa = undefined"
          @al-mover-vista="
            ({ acercamiento, centro }) => {
              console.log(acercamiento, centro);
              updateMapParams(centro, acercamiento);
            }
          "
        >
          <SisdaiCapaXyz />
          <SisdaiCapaWms
            v-for="(capa, index) in storeSelected.selectedResources[resourceType]"
            :key="`${capa.uuid}_${randomNum}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
            :visible="storeSelected.shownFiles.dataLayer.visibility ?? true"
            :opacidad="storeSelected.shownFiles.dataLayer.opacity ?? 1"
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
