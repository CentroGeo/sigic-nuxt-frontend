<script setup>
/**
 * @typedef {Object} Props
 * @property {Array<{ pictograma: string, ruta: string }>} [subPaginas] - Lista obligatoria de subpaginas, debe contener `pictograma` y `ruta` cada objeto de la lista.
 * @property {Function} [funcionColapsar=undefined] - Función que se ejecutará al presionar el botón colapsar y alternar el estadoColpasable.
 * @property {Boolean} [estadoColapable=false] - Estado del icono colapsar, visible si se recibe la `funcionColapsar`.
 * @property {String} [idColapsable='id-colapsable'] - Identificador del elemento que se colapsa, con fines de accesibilidad y atributos aria.
 */

/** @type {Props} */
defineProps({
  subPaginas: {
    type: Array,
    required: true,
  },
  sesionPaginas: {
    type: Array,
    default: () => [],
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
    default: 'id-colapsable',
  },
});
const { status } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const estaLogueado = computed(() => status.value === 'authenticated');
const avatar_url = ref('cargando');

async function fetchAvatar() {
  const config = useRuntimeConfig();
  const url = `${config.public.geonodeApi}/account/me/profile/`;
  try {
    const infoRequest = await gnoxyFetch(url);
    if (!infoRequest.ok) {
      avatar_url.value = null;
    } else {
      const info = await infoRequest.json();
      avatar_url.value = info.avatar_url;
    }
  } catch {
    avatar_url.value = null;
  }
}
onMounted(() => {
  if (estaLogueado.value) {
    fetchAvatar();
  }
});
</script>

<template>
  <div class="nav-lateral" aria-label="Navegación lateral">
    <div class="nav-lateral-contenido">
      <div class="flex height-calc">
        <div class="columna-16 flex-vertical-inicio">
          <div>
            <div class="flex flex-contenido-centrado">
              <ul class="lista-sin-estilo p-t-3">
                <li v-if="funcionColapsar" class="p-b-3">
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

                <li
                  v-for="subPagina in subPaginas"
                  :key="`elemento-${subPagina.ruta}`"
                  v-globo-informacion="subPagina.globo"
                >
                  <nuxt-link
                    class="boton-pictograma boton-sin-contenedor-primario"
                    :to="subPagina.ruta"
                  >
                    <span :class="subPagina.pictograma" aria-hidden="true" />
                  </nuxt-link>
                </li>
              </ul>
            </div>

            <div v-if="estaLogueado">
              <p class="borde-b borde-color-secundario m-y-0"></p>

              <div class="flex flex-contenido-centrado">
                <ul class="lista-sin-estilo">
                  <li
                    v-for="sesionPagina in sesionPaginas"
                    :key="`elemento-${sesionPagina.ruta}`"
                    v-globo-informacion="sesionPagina.globo"
                  >
                    <nuxt-link
                      class="boton-pictograma boton-sin-contenedor-primario"
                      :to="sesionPagina.ruta"
                    >
                      <span :class="sesionPagina.pictograma" aria-hidden="true" />
                    </nuxt-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div v-if="estaLogueado" class="columna-16 flex-vertical-final">
          <div class="flex flex-contenido-centrado">
            <ul class="lista-sin-estilo">
              <li>
                <div v-if="avatar_url && avatar_url != 'cargando'" class="avatar-imagen">
                  <img :src="avatar_url" alt="" />
                </div>
                <div v-else-if="avatar_url && avatar_url === 'cargando'" class="avatar-imagen">
                  <img src="/img/loader.gif" alt="" />
                </div>
                <div v-else>
                  <p class="pictograma-persona texto-color-acento"></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-lateral {
  --altura-consulta-esc: calc(100vh - 112px);
  width: 48px;
  box-shadow: 4px 0 8px -4px var(--navegacion-primaria-sombra);
  z-index: 9997;
  height: var(--altura-consulta-esc);
  .nav-lateral-contenido {
    height: auto;
    position: sticky;
    top: 50px;
    .height-calc {
      height: var(--altura-consulta-esc);
    }
    ul {
      margin: 16px 0;
      li {
        margin: 0px;
        .avatar-imagen {
          border-radius: 32px;
          height: 32px;
          width: 32px;
          overflow: hidden;
          img {
            object-fit: cover;
          }
        }
        p {
          font-size: 32px;
        }
      }
    }
  }
}
</style>
