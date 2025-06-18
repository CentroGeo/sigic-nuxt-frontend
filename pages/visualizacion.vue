<script setup>
import SisdaiMapa from "@centrogeomx/sisdai-mapas/src/componentes/mapa/SisdaiMapa.vue";
import SisdaiCapaXyz from "@centrogeomx/sisdai-mapas/src/componentes/capa/xyz/SisdaiCapaXyz.vue";
</script>
<template>
  <main>
    <h2>Visualización</h2>
    <section id="">
      <div class="contenedor">
        <h3>Sección</h3>
        <SisdaiMapa
          descripcion="Mapa básico con una capa base visible a nivel mundial."
        >
          <template #panel-encabezado-vis>
            <p class="vis-titulo-visualizacion">Mapa básico</p>
          </template>

          <SisdaiCapaXyz />
        </SisdaiMapa>
      </div>
    </section>
  </main>
</template>
