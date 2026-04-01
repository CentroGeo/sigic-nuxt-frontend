<script setup>
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { useResourcesSupplements } from '~/composables/useResourcesSupplements';

import {
  SisdaiCapaArcgis,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiLeyendaArcgis,
  SisdaiLeyendaWms,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';
import { categoriesInSpanish, resourceTypeDic, tooltipContent } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
storeConsulta.resourceType = resourceTypeDic.dataLayer;
const config = useRuntimeConfig();

const storeCatalogo = useResourcesCatalogoStore();
const { gnoxyFetch } = useGnoxyUrl();
const { findServer, hasWFS, getSLDs } = useResourcesSupplements();
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
const serverType = ref();
const revisionMetadatos = ref(null);
const modalOpacidad = ref(null);
const controlOpacidad = ref();
const layerOpacity = ref(100);
const hasAttrTable = ref(null);
const tablaChild = ref(null);
const isDownloadable = ref(null);
const downloadOneChild = ref();
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
      tablaChild.value?.abrirModalTabla();
    },
  },
  {
    excludeFor: 'none',
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    globo: 'Opacidad',
    action: () => {
      modalOpacidad.value?.abrirModal();
    },
  },
  {
    excludeFor: 'remotes',
    label: 'Descargar archivo',
    pictogram: 'pictograma-archivo-descargar',
    globo: 'Descargar',
    action: () => {
      downloadOneChild.value?.abrirModalDescarga();
    },
  },
]);

const vistaDelMapa = ref({ extension: storeConsulta.mapExtent });

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

  actualButtons.value = buttons;
  hasAttrTable.value = actualButtons.value.map((d) => d.label).includes('Ver tablas');
  isDownloadable.value = actualButtons.value.map((d) => d.label).includes('Descargar archivo');
}

watch(
  () => storeConsulta.mapExtent,
  (extension) => {
    if (extension === undefined) return;
    vistaDelMapa.value = { extension };
  }
);

onMounted(async () => {
  storeConsulta.catalogoColapsado = true;
  resourceElement.value = await storeCatalogo.fetchResourceByPk(selectedPk);
  serverType.value = findServer(resourceElement.value).toLowerCase().includes('arcgis')
    ? 'arcgis'
    : 'ogc';
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
    <div class="m-y-4 flex flex-contenido-separado">
      <h2 class="m-0">{{ resourceElement.title }}</h2>
      <button class="boton-secundario p-1" @click="revisionMetadatos?.abrirModalRevision">
        Ver metadatos
      </button>
    </div>

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
              v-if="serverType === 'ogc'"
              :key="`wms-${resourceElement.pk}`"
              :capa="resourceElement.alternate"
              :consulta="gnoxyFetch"
              :fuente="findServer(resourceElement)"
              :mosaicos="true"
              :estilo="selectedStyle"
              :opacidad="layerOpacity / 100"
            />

            <SisdaiCapaArcgis
              v-if="serverType === 'arcgis'"
              :key="`arcgis-${resourceElement.pk}`"
              :fuente="findServer(resourceElement).replace('?', '')"
              :capa="resourceElement.alternate.split(':')[1]"
              :mosaicos="true"
              :opacidad="layerOpacity / 100"
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

                  <!--Globos de información-->
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

                <!--Etiquetas de Mis Archivos y Catálogo externo-->
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

                    <!--Leyendas -->
                    <SisdaiLeyendaWms
                      v-if="serverType === 'ogc'"
                      :consulta="gnoxyFetch"
                      :fuente="findServer(resourceElement).replace('?', '')"
                      :nombre="resourceElement.alternate"
                      :titulo="resourceElement.title || 'cargando...'"
                      :estilo="selectedStyle"
                      :sin-control="true"
                      :sin-control-clases="true"
                    />

                    <SisdaiLeyendaArcgis
                      v-else
                      :sin-control="true"
                      :sin-control-clases="true"
                      :titulo="resourceElement.title || 'cargando...'"
                      :capa="resourceElement.alternate.split(':')[1]"
                      :fuente="findServer(resourceElement).replace('?', '')"
                    />
                  </div>

                  <!-- Acciones -->
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
              </div>
            </div>
          </div>

          <div id="los-modales">
            <!--Modal descarga-->
            <ConsultaModalDescarga
              v-if="isDownloadable"
              ref="downloadOneChild"
              :key="`descarga_${resourceElement.pk}_${'dataLayer'}`"
              :resource-type="'dataLayer'"
              :selected-element="resourceElement"
            />

            <!--Modal tabla-->
            <CatalogoModalTabla
              v-if="hasAttrTable"
              ref="tablaChild"
              :key="`tabla_${resourceElement.pk}_${'dataLayer'}`"
              :selected-element="resourceElement"
              @notify-download="
                tablaChild.cerrarModalTabla();
                downloadOneChild.abrirModalDescarga();
              "
            />

            <!-- Modal opacidad -->
            <ClientOnly>
              <SisdaiModal ref="modalOpacidad">
                <template #encabezado>
                  <h1>Opacidad</h1>
                </template>

                <template #cuerpo>
                  <p>{{ resourceElement.title }}</p>
                  <div class="contenedor flex">
                    <div class="columna-11">
                      <SisdaiControlDeslizante
                        id="contro-opacidad"
                        ref="controlOpacidad"
                        class="deslizante"
                        :val_min="0"
                        :val_max="100"
                        :val_entrada="layerOpacity"
                        step="1"
                        @update:val_entrada="
                          ($event) => {
                            controlOpacidad.valor_seleccionado = $event;
                            layerOpacity = Number(controlOpacidad.valor_seleccionado);
                          }
                        "
                      />
                    </div>

                    <div class="columna-5">
                      <input
                        type="number"
                        :value="controlOpacidad?.valor_seleccionado"
                        min="0"
                        max="100"
                        step="1"
                        @change="
                          (e) => {
                            layerOpacity = e.target.value;
                          }
                        "
                      />
                    </div>
                  </div>
                </template>
              </SisdaiModal>
            </ClientOnly>
          </div>
        </div>
      </template>
    </ConsultaLayoutPaneles>
  </div>
  <div v-else class="flex flex-contenido-centrado">
    <figure>
      <img
        class="color-invertir"
        :src="`${config.app.baseURL}img/loader.gif`"
        alt="Loader de SIGIC"
      />
      <figcaption class="texto-centrado">Cargando Capa Geográfica</figcaption>
    </figure>
  </div>

  <CatalogoModalRevisionMeta
    ref="revisionMetadatos"
    :review-pk="selectedPk"
    :resource-type="'datasets'"
  />
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
