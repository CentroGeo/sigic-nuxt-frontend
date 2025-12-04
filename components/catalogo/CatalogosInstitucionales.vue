<script setup>
import { fetchHarvesters } from '~/utils/catalogo';

const harvesters = ref([]);
const isLoading = ref(true);
const fetchStatus = ref(null);
const queryParams = ref({ page_size: 3 });

async function getResources() {
  isLoading.value = true;
  const { status, data } = await fetchHarvesters(true, queryParams.value);
  harvesters.value = data;
  fetchStatus.value = status;

  isLoading.value = false;
}
getResources();
</script>
<template>
  <div id="servicios-institucionales">
    <h3>Explora catálogos externos preconectados</h3>
    <p>
      Explora los recursos de información de catálogos precargados, al importarlos podrás agregarlos
      a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás completar
      previamente los metadatos de cada uno.
    </p>

    <!--El spinner general-->
    <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
      <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
    </div>

    <!--Las tarjetas de servicios remotos-->
    <div v-if="!isLoading && fetchStatus === 'ok'" class="flex">
      <CatalogoTarjetaServicio
        v-for="catalogo in harvesters"
        :key="catalogo.id"
        :harvester="catalogo"
      />
    </div>

    <!--Mensaje de error si falla la petición-->
    <div
      v-if="!isLoading && fetchStatus === 'error'"
      class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
    >
      <span class="pictograma-alerta" />
      <b> No se pudo completar la solicitud. Revisa tu conexión e intentalo de nuevo más tarde.</b>
    </div>

    <div class="flex flex-contenido-centrado m-y-2">
      <NuxtLink to="/catalogo/servicios-remotos/servicios-precargados" style="font-weight: bold">
        Ver todos los catálogos externos preconectados
      </NuxtLink>
    </div>
  </div>
</template>
