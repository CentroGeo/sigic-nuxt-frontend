<script setup>
definePageMeta({ middleware: "redireccionar-modulo-ia" });

const ruta = "/ia";
</script>

<template>
  <div class="modulo-ia flex">
    <!-- TODO: ✅ modificar a UiNavLateral -->
    <!-- <IaNavegacionLateral /> -->
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-ayuda',
          ruta: `${ruta}/chats`,
        },
        {
          pictograma: 'pictograma-ayuda',
          ruta: `${ruta}/proyectos`,
        },
      ]"
      :id-colapsable="
        `uinavegacionlateral-` + Math.random().toString(36).substring(2)
      "
    />

    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-ia {
  gap: 0;
  height: 85vh;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
