<script setup>
const props = defineProps({
  harvester: {
    type: Object,
    default: () => {},
  },
});
const { harvester } = toRefs(props);

function irARutaQuery() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      id: harvester.value.id,
      title: harvester.value.title,
      /*         unique_identifier: v.unique_identifier,
        remote_resource_type: v.remote_resource_type, */
    },
  });
}
</script>
<template>
  <div class="tarjeta columna-5">
    <div class="tarjeta-cuerpo">
      <img src="@/public/img/icono_sigic.png" height="72px" width="72px" />
      <p class="tarjeta-titulo" style="font-weight: bold">{{ harvester.title }}</p>
      <p>{{ harvester.remote_url }}</p>
      <UiNumeroElementos :numero="harvester.total_resources" :etiqueta="'Capas'" />
      <button
        class="boton-primario flex flex-contenido-centrado"
        style="width: 100%; margin: 8px"
        @click="irARutaQuery"
      >
        Explorar recursos
      </button>
      <button
        class="boton-secundario flex flex-contenido-centrado"
        style="width: 100%; margin: 8px"
        disabled
      >
        Más información
      </button>
    </div>
    <div class="tarjeta-pie columna-16"></div>
  </div>
</template>
