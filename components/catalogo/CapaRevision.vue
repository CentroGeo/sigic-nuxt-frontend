<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import {
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiLeyendaWms,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';
import {
  categoriesInSpanish,
  findServer,
  getSLDs,
  hasWFS,
  resourceTypeDic,
  tooltipContent,
} from '~/utils/consulta';

const storeConsulta = useConsultaStore();
storeConsulta.resourceType = resourceTypeDic.dataLayer;

const storeCatalogo = useResourcesCatalogoStore();
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const selectedPk = route.query.pk;
const isLoading = ref(true);
const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
const username = ref(data.value ? data.value.user.email : undefined);

const resourceElement = ref();
const selectedStyle = ref();
const predeterminedStyle = ref();
const allStyles = ref();

const vistaDelMapa = ref({ extension: storeConsulta.mapExtent });

watch(
  () => storeConsulta.mapExtent,
  (extension) => {
    if (extension === undefined) return;
    vistaDelMapa.value = { extension };
  }
);

const shownModal = ref('ninguno');
const modalResource = ref(null);
const tablaChild = ref(null);
//const downloadOneChild = ref(null);

function notifyTablaChild(resource) {
  shownModal.value = 'tablaModal';
  modalResource.value = resource;
  nextTick(() => {
    tablaChild.value?.abrirModalTabla();
  });
}

/* function notifyDownloadOneChild(resource) {
  shownModal.value = 'downloadOne';
  modalResource.value = resource;
  nextTick(() => {
    downloadOneChild.value?.abrirModalDescarga();
  });
} */

/* function changeModal(to) {
  if (to === 'downloadOne') {
    notifyDownloadOneChild(modalResource.value);
  }
} */

const actualButtons = ref({});
const optionsButtons = ref([
  {
    excludeFor: 'none',
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    globo: 'Zoom a la capa',
    action: () => {
      storeConsulta.mapExtent = resourceElement.value.extent.coords.join(',');
    },
  },
  {
    excludeFor: 'noTables',
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    globo: 'Ver tabla',
    action: () => {
      notifyTablaChild(resourceElement.value);
    },
  },
]);

async function updateFunctions() {
  let buttons = optionsButtons.value;
  if (resourceElement.value.subtype === 'raster') {
    buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
  }
  if (resourceElement.value.sourcetype === 'REMOTE') {
    // Se excluye el botón de descargar para remotos
    buttons = buttons.filter((d) => d.excludeFor !== 'remotes');
    const resourceHasWMS = await hasWFS(resourceElement.value, 'table');
    // Se excluye el botón para ver tablas en caso de que el archivo remoto no permita consultar la tabla
    if (resourceHasWMS === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  if (resourceElement.value.is_approved === false && resourceElement.value.is_published === false) {
    // Se excluye el botón OWS para recursos privados
    buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
  }
  actualButtons.value = buttons;
}

onMounted(async () => {
  storeConsulta.catalogoColapsado = true;
  resourceElement.value = await storeCatalogo.fetchResourceByPk(selectedPk);
  const { defaultStyle, styleList } = await getSLDs(resourceElement.value);
  predeterminedStyle.value = defaultStyle;
  selectedStyle.value = defaultStyle;
  allStyles.value = styleList;
  updateFunctions();

  isLoading.value = false;
});
</script>

<template>
  <div v-if="!isLoading">
    <h2>{{ resourceElement.title }}</h2>
    <ConsultaLayoutPaneles>
      <template #catalogo> </template>

      <template #visualizador>
        <ClientOnly>
          <SisdaiMapa
            class="gema"
            :vista="vistaDelMapa"
            :dividir="storeConsulta.divisionMapa"
            @click-centrar="storeConsulta.resetMapExtent"
          >
            <SisdaiCapaXyz :posicion="0" />

            <SisdaiCapaWms
              :key="`wms-${resourceElement.pk}`"
              :capa="resourceElement.alternate"
              :consulta="gnoxyFetch"
              :fuente="findServer(resourceElement)"
              :mosaicos="true"
              :estilo="selectedStyle"
            />
          </SisdaiMapa>
        </ClientOnly>
      </template>

      <template #seleccion>
        <div class="seleccion-layout">
          <div class="m-x-2 m-y-1">
            <div class="tarjeta m-y-1">
              <div class="tarjeta-selected fondo-color-acento">
                <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
                  <p v-if="resourceElement" class="tarjeta-texto-secundario m-0">
                    {{
                      resourceElement?.category
                        ? categoriesInSpanish[resourceElement?.category.gn_description]
                        : 'Sin Clasificar'
                    }}
                  </p>

                  <div class="m-0">
                    <button
                      v-globo-informacion:izquierda="{
                        contenido: tooltipContent(resourceElement || {}),
                        desfase: [0, 8],
                      }"
                      class="boton-pictograma boton-sin-contenedor-secundario"
                      aria-label="Mostrar información"
                      type="button"
                    >
                      <span class="pictograma-informacion pictograma-mediano" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div v-if="resourceElement">
                  <div
                    v-if="isLoggedIn && resourceElement.owner.username === username"
                    class="id-tag flex m-b-1 m-t-0"
                  >
                    <span class="pictograma-persona"></span>
                    Mis archivos
                  </div>
                  <div
                    v-if="resourceElement.sourcetype === 'REMOTE'"
                    class="id-tag flex m-b-1 m-t-0"
                  >
                    <span class="pictograma-colaborar"></span>
                    Catálogo externo
                  </div>
                </div>

                <div v-if="resourceElement.title">
                  <div class="m-y-2">
                    <!--Selector de estilos -->
                    <div v-if="allStyles.length > 1" class="m-t-2">
                      <ClientOnly>
                        <SisdaiSelector
                          v-model="selectedStyle"
                          etiqueta="Variables disponibles"
                          texto_ayuda="Texto de ayuda."
                        >
                          <option v-for="estilo in allStyles" :key="estilo" :value="estilo">
                            {{ estilo }}
                          </option>
                        </SisdaiSelector>
                      </ClientOnly>
                    </div>
                    <SisdaiLeyendaWms
                      :consulta="gnoxyFetch"
                      :fuente="findServer(resourceElement)"
                      :nombre="resourceElement.alternate"
                      :titulo="resourceElement.title || 'cargando...'"
                      :estilo="selectedStyle"
                      :sin-control="true"
                      :sin-control-clases="true"
                    />
                  </div>

                  <div v-if="resourceElement.title" class="flex flex-contenido-final">
                    <button
                      v-for="button in actualButtons"
                      :key="button.label"
                      v-globo-informacion:derecha="button.globo"
                      class="boton-pictograma boton-sin-contenedor-secundario"
                      :aria-label="button.label"
                      type="button"
                      @click="button.action"
                    >
                      <span :class="button.pictogram" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div v-else class="flex flex-contenido-centrado">
                  <img src="/img/loader.gif" alt="...Cargando" height="50px" />
                </div>
              </div>
            </div>
          </div>

          <!--  <div id="los-modales">
            <ConsultaModalDescarga
              v-if="shownModal === 'downloadOne'"
              ref="downloadOneChild"
              :key="`descarga_${modalResource.pk}_${'dataLayer'}`"
              :resource-type="'dataLayer'"
              :selected-element="modalResource"
            />

            <CatalogoModalTabla
              v-if="shownModal === 'tablaModal'"
              ref="tablaChild"
              :key="`tabla_${modalResource.pk}_${'dataLayer'}`"
              :selected-element="modalResource"
              @notify-download="changeModal('downloadOne')"
            />

            <ConsultaModalOpacidad
              v-if="shownModal === 'opacityModal'"
              ref="opacityChild"
              :key="`opacidad_${modalResource.pk}_${'dataLayer'}`"
              :selected-element="modalResource"
            /> 
          </div>-->
        </div>
      </template>
    </ConsultaLayoutPaneles>
  </div>
</template>

<style lang="scss" scoped>
.gema {
  --altura-consulta-esc: calc(100vh - 112px);
  height: var(--altura-consulta-esc) !important;
}
.selectores-division-contenedor {
  z-index: 2;
  right: 0;
  top: 160px;
  position: absolute;

  cursor: inherit;
  pointer-events: inherit;
  opacity: 1;
  max-width: 260px;

  &.colapsado {
    cursor: default;
    pointer-events: none;
    opacity: 0;
    max-width: 0;
    transition:
      opacity 0.27s ease,
      max-width 0.27s ease;
  }
}

.seleccion-layout {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  overflow-x: hidden;

  .encabeado-seleccion {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
}

.tarjeta-selected {
  padding: 16px;
  color: var(--campo-etiqueta-color);

  .encabezado-tarjeta {
    align-items: center;
  }
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
.id-tag {
  background-color: var(--fondo-acento);
  padding: 8px;
  border: solid 1px;
  border-radius: 8px;
  color: var(--campo-etiqueta-color);
  width: fit-content;
  align-items: left;
  gap: 8px;
}
.flex {
  gap: 8px;
}
</style>
