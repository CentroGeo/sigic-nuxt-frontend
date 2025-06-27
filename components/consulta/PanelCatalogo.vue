<script setup>
import { useConsultaStore } from "~/stores/consulta.js";
const storeConsulta = useConsultaStore();
</script>
<template>
  <div>
    <div
      id="ID-UNICO"
      class="panel-catalogo"
      :class="{ colapsado: storeConsulta.catalogoColapsado }"
      :aria-hidden="storeConsulta.catalogoColapsado"
    >
      <slot />
    </div>
  </div>
</template>
<style lang="scss">
.panel-catalogo.colapsado {
  visibility: hidden;
  display: none;
  width: 0;
}
</style>
