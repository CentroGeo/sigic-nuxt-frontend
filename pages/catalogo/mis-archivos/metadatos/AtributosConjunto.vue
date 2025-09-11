<script setup>
const route = useRoute();
const pk = route.query.data;
// Access all query params
console.log(pk);
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <div>Editar</div>
        <p>Titulo</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
