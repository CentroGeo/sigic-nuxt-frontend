<script setup>
import PanelCatalogo from "~/components/consulta/PanelCatalogo.vue";
import PanelSeleccion from "~/components/consulta/PanelSeleccion.vue";
import LayoutConsulta from "~/components/consulta/LayoutConsulta.vue";
</script>
<template>
  <LayoutConsulta>
    <div class="visualizacion-doc">
      <PanelCatalogo>
        <h3>Documentos</h3>
      </PanelCatalogo>

      <h2>Título</h2>

      <PanelSeleccion>
        <h3>Documentos seleccionados</h3>
      </PanelSeleccion>
    </div>
  </LayoutConsulta>
</template>
<style lang="scss">
.visualizacion-doc {
  width: 100%;
  display: flex;
}
</style>
