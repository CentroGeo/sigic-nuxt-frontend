<script setup>
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
  funcionDescarga: { type: Function, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const resourcesStore = useSelectedResourcesStore();
const buttonTagDict = {
  dataLayer: "mapa",
  dataTable: "archivos",
  document: "archivos",
};
const route = useRoute();
const downloadAllChild = ref(null);
function notifyDownloadAllChild() {
  downloadAllChild.value?.abrirModalDescargaAll();
}

function shareState() {
  console.log("Se copia el url en el portapapeles: ", route.fullPath);
}
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
            class="boton-primario"
            aria-label="Descargar mapa"
            @click="
              resourceType === 'dataLayer'
                ? funcionDescarga()
                : notifyDownloadAllChild()
            "
          >
            Descargar {{ buttonTagDict[resourceType] }}
            <span class="pictograma-mapa-generador" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Compartir"
            @click="shareState"
          >
            <span class="pictograma-compartir" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Eliminar"
            @click="resourcesStore.resetResource(resourceType)"
          >
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </div>

        <UiNumeroElementos
          :numero="resourcesStore.selectedResources[resourceType].length"
          :etiqueta="etiquetaElementos"
        />
      </div>
    </div>

    <div class="m-x-2 m-y-1">
      <ConsultaElementoSeleccionado
        v-for="resource in resourcesStore.selectedResources[resourceType]"
        :key="`seleccion-${resource.uuid}`"
        :selected-element="resource"
        :resource-type="resourceType"
      />
    </div>

    <ConsultaModalDescargaAll
      ref="downloadAllChild"
      :resource-type="resourceType"
    />
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
