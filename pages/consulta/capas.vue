<script setup>
const { resourcesList } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 1000,
  resourceType: "dataset",
});
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

      <ul class="borde-t">
        <li v-for="resource in resourcesList" :key="resource.uuid">
          <button>
            {{ resource.title }}
          </button>
        </li>
      </ul>
    </template>

    <template #visualizador>Mapa</template>

    <template #seleccion>Capas seleccionadas</template>
  </ConsultaLayoutPaneles>
</template>

<style lang="scss"></style>
