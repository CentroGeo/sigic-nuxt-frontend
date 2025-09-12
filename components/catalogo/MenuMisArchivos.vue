<script setup>
/**
 * @typedef {Object} Props
 * @property {Array} [opciones=[]] - Indica la o las opciones de navegación del menú.
 */
/** @type {Props} */
const props = defineProps({
  opciones: { type: Array, default: Array },
  notificacion: { type: Boolean, default: false },
});
const route = useRoute();
</script>
<template>
  <div class="menu-mis-archivos p-t-5 p-b-3">
    <div class="flex">
      <div v-for="value in props.opciones" :key="value.texto">
        <div v-if="value.notificacion" class="notificacion">
          <div class="circulo"></div>
        </div>
        <nuxt-link :to="value.ruta">{{ value.texto }} </nuxt-link>

        <div :class="route.path === value.ruta ? 'borde-enlace-activo' : ''"></div>
      </div>
    </div>
    <div class="borde-b borde-color-secundario"></div>
  </div>
</template>

<style lang="scss" scoped>
.menu-mis-archivos {
  .flex {
    gap: 32px;
    .notificacion {
      position: relative;
      .circulo {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: var(--color-informativo-2);
        border-radius: 50%;
        right: -16px;
      }
    }
    .borde-enlace-activo {
      position: relative;
      width: 40px;
      height: 4px;
      padding-bottom: 4px;
      border-radius: 2px 2px 0px 0px;
      background-color: var(--boton-primario-borde);
      text-align: center;
      margin: 8px auto 0;
    }
  }
}
</style>
