<template>
  <div class="modulo-ia">
    <div class="nav-lateral">
      <ul>
        <li>
          <div class="avatar-imagen">
            <img
              src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg"
              alt=""
            />
          </div>
        </li>
      </ul>
      <ul>
        <li>
          <nuxt-link
            class="boton-pictograma boton-sin-contenedor-primario"
            to="/ia/chat"
          >
            <span class="pictograma-ayuda" aria-hidden="true" />
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            class="boton-pictograma boton-sin-contenedor-primario"
            to="/ia/proyectos"
          >
            <span class="pictograma-ayuda" aria-hidden="true" />
          </nuxt-link>
        </li>
      </ul>
    </div>

    <slot />
  </div>
</template>

<style lang="scss">
.modulo-ia {
  width: 100%;
  height: 85vh;
  display: flex;
  .nav-lateral {
    width: 48px;
    box-shadow: 4px 0 8px -4px var(--navegacion-primaria-sombra);
    ul {
      padding: 0 8px;
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
