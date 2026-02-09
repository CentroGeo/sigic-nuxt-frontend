<script setup>
const props = defineProps({
  harvester: {
    type: Object,
    default: () => {},
  },
});
const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
const { harvester } = toRefs(props);
const etiquetas = harvester.value.etiquetas.split(',');

function irARutaQuery() {
  navigateTo({
    path: `/catalogo/servicios-remotos/agregar`,
    query: {
      id: harvester.value.id,
    },
  });
}
</script>
<template>
  <div class="tarjeta columna-5">
    <div class="tarjeta-cuerpo">
      <div class="flex flex-contenido-final">
        <div
          v-for="etiqueta in etiquetas"
          :key="etiqueta"
          class="borde-redondeado-16 p-1 etiquetas"
        >
          {{ etiqueta }}
        </div>
      </div>
      <div class="tarjeta-titulo">
        <img
          src="@/public/img/icono_sigic.png"
          height="40px"
          width="40px"
          class="m-0 color-invertir"
        />
        <p class="m-0" style="font-weight: bold">{{ harvester.title }}</p>
      </div>

      <p>{{ harvester.descripcion }}</p>
      <!-- <UiNumeroElementos :numero="harvester.total_resources" :etiqueta="'Capas'" /> -->
      <button
        class="boton-primario flex flex-contenido-centrado"
        style="width: 100%; margin: 8px"
        :disabled="!isLoggedIn"
        @click="irARutaQuery"
      >
        Conectar Servicio
      </button>
      <button
        class="boton-secundario flex flex-contenido-centrado"
        style="width: 100%; margin: 8px"
      >
        Más Información
      </button>
    </div>
    <div class="tarjeta-pie columna-16"></div>
  </div>
</template>
<style lang="scss" scoped>
.etiquetas {
  color: var(--boton-secundario-color);
  border: solid 1px var(--boton-secundario-color);
}
</style>
