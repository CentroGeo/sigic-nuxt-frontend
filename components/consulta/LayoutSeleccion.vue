<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeSelected = useSelectedResources2Store();

const props = defineProps({
  titulo: { type: String, default: 'Título' },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
  funcionDescarga: { type: Function, default: undefined },
});
const { titulo } = toRefs(props);
const buttonTagDict = {
  dataLayer: 'mapa',
  dataTable: 'archivos',
  document: 'archivos',
};
// const route = useRoute();
const shownModal = ref('ninguno');
const modalResource = ref(null);
const owsLink = ref(null);
const downloadAllChild = ref(null);
const downloadOneChild = ref(null);
const opacityChild = ref(null);
const tablaChild = ref(null);
const shareChild = ref(null);
const mapChild = ref(null);
const borrarChild = ref(null);
const owsChild = ref(null);

function notifyDownloadAllChild() {
  shownModal.value = 'downloadAll';
  nextTick(() => {
    downloadAllChild.value?.abrirModalDescargaAll();
  });
}

function notifyDownloadOneChild(resource) {
  shownModal.value = 'downloadOne';
  modalResource.value = resource;
  nextTick(() => {
    downloadOneChild.value?.abrirModalDescarga();
  });
}
function notifyTablaChild(resource) {
  shownModal.value = 'tablaModal';
  modalResource.value = resource;
  nextTick(() => {
    tablaChild.value?.abrirModalTabla();
  });
}
function notifyOpacityChild(resource) {
  shownModal.value = 'opacityModal';
  modalResource.value = resource;
  nextTick(() => {
    opacityChild.value?.abrirModalOpacidad();
  });
}

function notifyMapaChild(resource) {
  shownModal.value = 'mapModal';
  modalResource.value = resource;
  nextTick(() => {
    mapChild.value?.abrirModalMapa();
  });
}
function notifyBorrarChild() {
  shownModal.value = 'borrarModal';
  nextTick(() => {
    borrarChild.value.abrirModalBorrarTodo();
  });
}

function notifyOWSChild(link) {
  owsLink.value = link;
  shownModal.value = 'owsModal';
  nextTick(() => {
    owsChild.value.abrirModalOWS();
  });
}
function notifyShareChild() {
  shareChild.value?.abrirModalCompartir();
}

function shareState() {
  shownModal.value = 'share';
  //console.log('Se copia el url en el portapapeles: ', route.fullPath);
  nextTick(() => {
    notifyShareChild();
  });
}

function changeModal(to) {
  if (to === 'downloadOne') {
    notifyDownloadOneChild(modalResource.value);
  }
}

// const isOpen = ref(false);
const storeConsulta = useConsultaStore();
const dividirMapa = computed({
  get: () => storeConsulta.divisionMapaActivado(),
  set(nuevValor) {
    if (nuevValor) storeConsulta.activarDivisionMapa();
    else storeConsulta.desactivarDivisionMapa();
  },
});
</script>

<template>
  <div class="seleccion-layout">
    <div class="encabeado-seleccion">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <div class="flex m-y-3">
          <button
            type="button"
            class="boton-primario boton-chico"
            aria-label="Descargar mapa"
            @click="
              resourceType === resourceTypeDic.dataLayer
                ? funcionDescarga()
                : notifyDownloadAllChild()
            "
          >
            Descargar {{ buttonTagDict[resourceType] }}
            <span class="pictograma-mapa-generador" aria-hidden="true" />
          </button>

          <button
            v-globo-informacion:derecha="'Compartir'"
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Compartir"
            @click="shareState"
          >
            <span class="pictograma-compartir" aria-hidden="true" />
          </button>

          <button
            v-globo-informacion:derecha="'Eliminar selección'"
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Eliminar"
            @click="notifyBorrarChild()"
          >
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </div>

        <div v-if="resourceType === resourceTypeDic.dataLayer" class="flex m-y-3">
          <button
            v-globo-informacion:derecha="
              storeConsulta.contenedorSelectoresDivisionColapsado ? 'Cerrar' : 'Abrir'
            "
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            :aria-label="storeConsulta.contenedorSelectoresDivisionColapsado ? 'Cerrar' : 'Abrir'"
            :disabled="!dividirMapa"
            style="align-self: center"
            @click="
              storeConsulta.contenedorSelectoresDivisionColapsado =
                !storeConsulta.contenedorSelectoresDivisionColapsado
            "
          >
            <span
              :class="`pictograma-angulo-${storeConsulta.contenedorSelectoresDivisionColapsado ? 'derecho' : 'izquierdo'}`"
              aria-hidden="true"
            />
          </button>

          <div class="contendor-control-dividir">
            <input id="control-dividir" v-model="dividirMapa" type="checkbox" />
            <label for="control-dividir"> Dividir pantalla </label>
          </div>
        </div>

        <UiNumeroElementos :numero="storeSelected.pks.length" :etiqueta="etiquetaElementos" />
      </div>
    </div>

    <div class="m-x-2 m-y-1">
      <ConsultaElementoSeleccionado
        v-for="resource in storeSelected.sortedDescending()"
        :key="`seleccion-${resource.pk}`"
        :selected-element="resource"
        :resource-type="resourceType"
        @open-opacity="(resource) => notifyOpacityChild(resource)"
        @open-download="(resource) => notifyDownloadOneChild(resource)"
        @open-tabla="(resource) => notifyTablaChild(resource)"
        @open-mapa="(resource) => notifyMapaChild(resource)"
        @open-o-w-s="notifyOWSChild"
      />
    </div>

    <div id="los-modales">
      <ConsultaModalBorrarTodo v-if="shownModal === 'borrarModal'" ref="borrarChild" />

      <ConsultaModalDescargaAll
        v-if="shownModal === 'downloadAll'"
        ref="downloadAllChild"
        :resource-type="resourceType"
      />

      <ConsultaModalCompartir v-if="shownModal === 'share'" ref="shareChild" />

      <ConsultaModalDescarga
        v-if="shownModal === 'downloadOne'"
        ref="downloadOneChild"
        :key="`descarga_${modalResource.pk}_${resourceType}`"
        :resource-type="resourceType"
        :selected-element="modalResource"
      />

      <ConsultaModalOpacidad
        v-if="shownModal === 'opacityModal'"
        ref="opacityChild"
        :key="`opacidad_${modalResource.pk}_${resourceType}`"
        :selected-element="modalResource"
      />

      <ConsultaModalTabla
        v-if="shownModal === 'tablaModal'"
        ref="tablaChild"
        :key="`tabla_${modalResource.pk}_${resourceType}`"
        :selected-element="modalResource"
        @notify-download="changeModal('downloadOne')"
      />

      <ConsultaModalMapa
        v-if="shownModal === 'mapModal'"
        ref="mapChild"
        :key="`mapa_${modalResource.pk}_${resourceType}`"
        :selected-element="modalResource"
        @notify-download="changeModal('downloadOne')"
      />

      <ConsultaModalOWS
        v-if="shownModal === 'owsModal'"
        ref="owsChild"
        :key="`ows_${owsLink}`"
        :ows-link="owsLink"
        :service="'OWS'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
</style>
