<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { exportarHTMLComoPNG } from '@centrogeomx/sisdai-mapas/funciones';

const resourceType = 'dataLayer';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';
const storeConsulta = useConsultaStore();
const extensionMapa = computed(() => storeConsulta.ajustarExtensionMapa || extensionNacional);

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();
const randomNum = ref(0);

const linkExportaMapa = ref();
function exportarMapa() {
  exportarHTMLComoPNG(document.querySelectorAll('.mapa .ol-viewport').item(0), linkExportaMapa.value);
}

const attributos = reactive({});
async function addAttribute(pk) {
  attributos[pk] = [];

  try {
    const { attributes } = await fetch(
      `${config.public.geonodeApi}/datasets/${pk}/attribute_set`
    ).then((response) => response.json());
    // console.log(attributes);

    const etiquetas = {};
    const columnas = attributes
      .filter((a) => a.visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map(({ attribute, attribute_label }) => {
        etiquetas[attribute] = attribute_label || attribute;
        return attribute;
      });
    // console.log(columnas);

    attributos[pk] = {
      params: {
        propertyName: columnas.join(","),
      },
      // attribute_label
      contenido: (data) =>
        columnas
          .map(
            (columna) =>
              `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`
          )
          .join(""),
    };
    // console.log(attributos[pk]);
  } catch (error) {
    console.error("Error en la búsqueda:", error);

    console.error(
      "Ocurrió un problema al realizar la búsqueda. Por favor, verifica tu conexión o intenta de nuevo más tarde."
    );

    if (error.response && error.response.status === 400) {
      console.error(
        "Los parámetros de búsqueda no son válidos. Revisa los filtros ingresados."
      );
    } else if (error.response && error.response.status === 500) {
      console.error("El servidor encontró un problema. Intenta más tarde.");
    }
  }
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
  },
  { deep: true }
);

// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate
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
            v-for="(capa, index) in storeSelected.selectedResources[resourceType]"
            :key="`${capa.uuid}_${randomNum}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
            :posicion="storeSelected.selectedResources.length - index"
            :cuadro-informativo="attributos[capa.pk]"
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
