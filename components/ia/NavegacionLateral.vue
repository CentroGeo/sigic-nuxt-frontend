<!-- TODO: esta se reúne con
la de ~/components/consulta/NavegacionLateral.vue -->
<script setup>
const ruta = "/ia";
const subPaginas = [
  {
    picto: "pictograma-ayuda",
    ruta: `${ruta}/chats`,
  },
  {
    picto: "pictograma-ayuda",
    ruta: `${ruta}/proyectos`,
  },
];
</script>

<template>
  <div class="nav-lateral" aria-label="Navegación Lateral">
    <ul class="lista-sin-estilo">
      <li>
        <div class="avatar-imagen">
          <img
            src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg"
            alt=""
          />
        </div>
      </li>

      <li v-for="subPagina in subPaginas" :key="`elemento-${subPagina.ruta}`">
        <nuxt-link
          class="boton-pictograma boton-sin-contenedor-primario"
          :to="subPagina.ruta"
        >
          <span :class="subPagina.picto" aria-hidden="true" />
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
    // list-style: none;

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
