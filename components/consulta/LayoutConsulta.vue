<script setup>
import { useConsultaStore } from "~/stores/consulta.js";
const storeConsulta = useConsultaStore();

definePageMeta({
  layout: "default",
});
</script>
<template>
  <div>
    <div class="modulo-consulta">
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
            <button
              class="boton-pictograma boton-sin-contenedor-primario"
              aria-label="Navegación lateral"
              aria-controls="ID-UNICO"
              :aria-expanded="!storeConsulta.catalogoColapsado"
              type="button"
              @click="storeConsulta.alternarCatalogoColapsable()"
            >
              <span
                :class="`pictograma-angulo-doble-${
                  storeConsulta.catalogoColapsado ? `derecha` : `izquierda`
                }`"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <nuxt-link
              class="boton-pictograma boton-sin-contenedor-primario"
              to="/consulta/"
              ><span class="pictograma-capas" aria-hidden="true"
            /></nuxt-link>
          </li>
          <li>
            <nuxt-link
              class="boton-pictograma boton-sin-contenedor-primario"
              to="/consulta/tabulados"
              ><span class="pictograma-tabla" aria-hidden="true"
            /></nuxt-link>
          </li>
          <li>
            <nuxt-link
              class="boton-pictograma boton-sin-contenedor-primario"
              to="/consulta/documentos"
              ><span class="pictograma-documento" aria-hidden="true"
            /></nuxt-link>
          </li>
        </ul>
      </div>

      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.modulo-consulta {
  width: 100%;
  height: 85vh;
  display: flex;
  .nav-lateral {
    // display: flex;
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
