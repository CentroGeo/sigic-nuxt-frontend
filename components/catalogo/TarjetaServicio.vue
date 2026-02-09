<script setup>
const props = defineProps({
  service: {
    type: Object,
    default: () => {},
  },
});
const { data } = useAuth();
const { service } = toRefs(props);
const emit = defineEmits(['serviceDetailsClicked']);
const isLoggedIn = ref(data.value ? true : false);
const etiquetas = service.value.etiquetas.split(',');

function irARutaQuery() {
  navigateTo({
    path: `/catalogo/servicios-remotos/agregar`,
    query: {
      id: service.value.id,
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
        <p class="m-0" style="font-weight: bold">{{ service.title }}</p>
      </div>

      <p>{{ service.descripcion }}</p>
      <!-- <UiNumeroElementos :numero="service.total_resources" :etiqueta="'Capas'" /> -->
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
        @click="emit('serviceDetailsClicked', service)"
      >
        Más Información
      </button>
    </div>
    <div class="tarjeta-pie columna-16"></div>
  </div>
</template>
<style lang="scss" scoped>
.etiquetas {
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  border: solid 1px var(--color-primario-4);
}
</style>
