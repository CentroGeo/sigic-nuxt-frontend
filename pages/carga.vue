<script setup>
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import { ref, watch } from "vue";
const archivo = ref("");
watch(archivo, (nv, ov) => {
  console.log(nv, ov);
});
</script>
<template>
  <main>
    <h2>Esto es la vista de garga</h2>
    <section id="">
      <div class="contenedor">
        <h3>Sección</h3>
        <SisdaiCampoBase
          etiqueta="Campo de archivo"
          ejemplo="tipo file"
          tipo="file"
          v-model="archivo"
        />
      </div>
    </section>
  </main>
</template>
