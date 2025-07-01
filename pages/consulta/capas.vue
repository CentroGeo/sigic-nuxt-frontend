<script setup>
const resourceType = "dataset";
const { resourcesList } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 1000,
  resourceType,
});

const storeSelected = useSelectedResourcesStore();
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <p class="h4 fondo-color-acento p-3 m-0">Capas geográficas</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <p>Buscador</p>

        <BaseNumeroElementos :numero="resourcesList.length" etiqueta="Capas" />
      </div>

      <ul class="lista-sin-dibujo">
        <li
          v-for="resource in resourcesList"
          :key="`disponible-${resource.uuid}`"
        >
          <button @click="storeSelected.addResource(resourceType, resource)">
            {{ resource.title }}
          </button>
        </li>
      </ul>
    </template>

    <template #visualizador>Mapa</template>

    <template #seleccion>
      <p class="h4 fondo-color-acento p-3 m-0">Capas seleccionadas</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <div class="flex">
          <button>Descargar mapa</button>
          <button>
            <span class="pictograma-compartir" aria-hidden="true" />
          </button>
          <button @click="storeSelected.resetResource(resourceType)">
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </div>

        <BaseNumeroElementos
          :numero="storeSelected.selectedResources[resourceType].length"
          etiqueta="Capas"
        />
      </div>

      <ul class="lista-sin-dibujo">
        <li
          v-for="resource in storeSelected.selectedResources[resourceType]"
          :key="`seleccion-${resource.uuid}`"
        >
          <button @click="storeSelected.removeResource(resourceType, resource)">
            {{ resource.title }}
          </button>
        </li>
      </ul>
    </template>
  </ConsultaLayoutPaneles>
</template>

<style lang="scss"></style>
