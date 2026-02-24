<script setup>
import { catalogosSugeridos } from '~/utils/catalogo';

const harvesters = catalogosSugeridos.slice(0, 3);
const modalServiciosExternos = ref(null);
const modalService = ref({});

function showModal(servicio) {
  modalService.value = servicio;
  nextTick(() => {
    modalServiciosExternos.value?.abrirModalCatalogoExterno();
  });
}
</script>
<template>
  <div id="servicios-institucionales">
    <h3>Explora catálogos externos preconectados</h3>
    <p>
      Explora los recursos de información de catálogos sugeridos, al importarlos podrás agregarlos a
      tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás completar
      previamente los metadatos de cada uno.
    </p>

    <!--Las tarjetas de servicios remotos-->
    <div class="flex">
      <CatalogoTarjetaServicio
        v-for="catalogo in harvesters"
        :key="catalogo.id"
        :service="catalogo"
        @service-details-clicked="(servicio) => showModal(servicio)"
      />
    </div>

    <div class="flex flex-contenido-centrado m-y-2">
      <NuxtLink to="/catalogo/servicios-remotos/servicios-sugeridos" style="font-weight: bold">
        Ver todos los catálogos externos preconectados
      </NuxtLink>
    </div>

    <CatalogoModalCatalogoExterno
      v-if="modalService.id"
      :id="modalService.id"
      ref="modalServiciosExternos"
      :service="modalService"
    />
  </div>
</template>
