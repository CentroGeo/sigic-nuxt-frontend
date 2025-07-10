<script setup>
/**
 * @typedef {Object} Props
 * @property {Array<{ pictograma: string, ruta: string }>} [subPaginas] - Lista obligatoria de subpaginas, debe contener `pictograma` y `ruta` cada objeto de la lista.
 * @property {Function} [funcionColapsar=undefined] - Función que se ejecutará al presionar el botón colapsar.
 * @property {Boolean} [estadoColapable=false] - Estado del icono colapsar, visible si se recibe la `funcionColapsar`.
 */

/** @type {Props} */
defineProps({
  subPaginas: {
    type: Array,
    required: true,
  },
  funcionColapsar: {
    type: Function,
    default: undefined,
  },
  estadoColapable: {
    type: Boolean,
    default: false,
  },
  idColapsable: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="nav-lateral" aria-label="Navegación lateral">
    <ul class="lista-sin-estilo">
      <li>
        <div class="avatar-imagen">
          <img
            src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg"
            alt=""
          />
        </div>
      </li>

      <li v-if="funcionColapsar">
        <button
          class="boton-pictograma boton-sin-contenedor-primario"
          aria-label="Colapsar"
          :aria-controls="idColapsable"
          :aria-expanded="!estadoColapable"
          type="button"
          @click="funcionColapsar"
        >
          <span
            :class="`pictograma-angulo-doble-${estadoColapable ? 'derecha' : 'izquierda'}`"
            aria-hidden="true"
          />
        </button>
      </li>

      <li v-for="subPagina in subPaginas" :key="`elemento-${subPagina.ruta}`">
        <nuxt-link
          class="boton-pictograma boton-sin-contenedor-primario"
          :to="subPagina.ruta"
        >
          <span :class="subPagina.pictograma" aria-hidden="true" />
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.nav-lateral {
  width: 48px;
  box-shadow: 4px 0 8px -4px var(--navegacion-primaria-sombra);
  z-index: 2;

  ul {
    padding: 0 8px;

    li {
      .avatar-imagen {
        border-radius: 32px;
        height: 32px;
        width: 32px;
        overflow: hidden;
        img {
          object-fit: cover;
        }
      }

      .router-link-exact-active {
        background: var(--boton-sin-contenedor-primario-enfoque-fondo);
        color: var(--boton-sin-contenedor-primario-enfoque-color);
      }
    }
  }
}
</style>
