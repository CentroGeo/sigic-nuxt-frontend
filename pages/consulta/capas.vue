<script setup>
const resourceType = "dataLayer";
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Capas geográficas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>

    <template #visualizador>
      <ClientOnly>
        <SisdaiMapas
          class="gema"
          :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
        >
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            v-for="capa in storeSelected.selectedResources[resourceType]"
            :key="capa.uuid"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
          />
        </SisdaiMapas>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
