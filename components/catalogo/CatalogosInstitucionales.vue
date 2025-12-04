<script setup>
const { gnoxyFetch } = useGnoxyUrl();

const config = useRuntimeConfig();
const institutionalHarvesters = ref([]);
const isLoading = ref(true);

async function fetchHarvesters() {
  isLoading.value = true;
  let harvesters = [];
  const endpoint = `${config.public.geonodeApi}/harvesters/?page_size=3`;
  // Obtenemos la información de todos los harvesters
  const requestHarvesters = await gnoxyFetch(endpoint);
  if (!requestHarvesters.ok) {
    const error = await requestHarvesters.json();
    console.error('Falló petición de harvesters:', error);
  }
  const resHarvesters = await requestHarvesters.json();
  harvesters = resHarvesters.harvesters;

  // A partir de la información de los harvesters, construimos un nuevo objeto para construir las tarjetas
  harvesters.forEach(async (h) => {
    const harvestableResourcesUrl = h.links.harvestable_resources;
    const resA = await gnoxyFetch(`${harvestableResourcesUrl}/?page_size=1`);
    const dataA = await resA.json();
    const totalResources = dataA.total;
    institutionalHarvesters.value.push({
      id: h.id,
      title: h.name,
      total_resources: totalResources,
      remote_url: h.remote_url,
    });
  });
  isLoading.value = false;
}
fetchHarvesters();
</script>
<template>
  <div id="servicios-institucionales">
    <h3>Explora catálogos externos preconectados</h3>
    <p>
      Explora los recursos de información de catálogos precargados, al importarlos podrás agregarlos
      a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás completar
      previamente los metadatos de cada uno.
    </p>
    <div v-if="isLoading" class="flex flex-contenido-centrado m-y-5">
      <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
    </div>
    <div v-else class="flex">
      <CatalogoTarjetaServicio
        v-for="catalogo in institutionalHarvesters"
        :key="catalogo.id"
        :harvester="catalogo"
      />
    </div>
    <div class="flex flex-contenido-centrado m-y-2">
      <NuxtLink to="/catalogo/servicios-remotos/servicios-precargados" style="font-weight: bold">
        Ver todos los catálogos externos preconectados
      </NuxtLink>
    </div>
  </div>
</template>
