<script setup>
definePageMeta({
  middleware: 'redireccionar-modulo-catalogo',
  bodyAttrs: {
    class: '',
  },
});
const ruta = '/catalogo';
const storeCatalogo = useCatalogoStore();
onUnmounted(() => (document.querySelector('body').className = ''));
</script>

<template>
  <div class="modulo-catalogo flex">
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-explorar',
          ruta: `${ruta}/explorar`,
          globo: 'Explorar',
        },
        {
          pictograma: 'pictograma-capas',
          ruta: `${ruta}/explorar/capas`,
          globo: 'Capas',
        },
        {
          pictograma: 'pictograma-tabla',
          ruta: `${ruta}/explorar/tablas`,
          globo: 'Datos tabulados',
        },
        {
          pictograma: 'pictograma-documento',
          ruta: `${ruta}/explorar/documentos`,
          globo: 'Documentos',
        },
      ]"
      :sesion-paginas="[
        {
          pictograma: 'pictograma-proyectos',
          ruta: `${ruta}/mis-archivos`,
          globo: 'Mis archivos',
        },
        {
          pictograma: 'pictograma-archivo-subir',
          ruta: `${ruta}/cargar-archivos`,
          globo: 'Carga de archivos',
        },
        {
          pictograma: 'pictograma-ayuda',
          ruta: `${ruta}/servicios-remotos`,
          globo: 'Carga de catálogos externos',
        },
      ]"
      :id-colapsable="storeCatalogo.idNavegacionLateral"
      :estado-colapable="storeCatalogo.catalogoColapsado"
      :funcion-colapsar="storeCatalogo.alternarCatalogoColapsable"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss">
.modulo-catalogo {
  gap: 0;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
