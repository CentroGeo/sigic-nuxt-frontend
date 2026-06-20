<script setup>
/**
 * IdegeoNavegacionPrincipal.vue
 * Navegación principal con identidad IDEGeo — reemplaza
 * SisdaiNavegacionPrincipal + MainNavegacion.
 *
 * Header blanco fijo con logo CentroGeo/IDEGeo, menú horizontal
 * y hamburguesa drawer para móvil. Colores: teal (--color-theme)
 * y dorado para acentos.
 */
import { onMounted, onUnmounted, ref } from 'vue';

const { status, signIn } = useAuth();
const route = useRoute();
const config = useRuntimeConfig();

const menuAbierto = ref(false);
const esMovil = ref(false);
const headerReducido = ref(false);

const mostrarInicio = computed(() => config.public.defaultPage);
const mostrarCatalogo = computed(() => config.public.enableCatalogoVista);
const mostrarConsulta = computed(() => config.public.enableConsulta);
const mostrarIaa = computed(() => config.public.enableIaa);
const mostrarLevantamiento = computed(() => config.public.enableLevantamiento);
const mostrarAuth = computed(() => config.public.enableAuth);
const mostrarAcercaDe = computed(() => config.public.enableAcercaDe);
const mostrarGeocontenidos = computed(() => config.public.enableGeocontenidos);

function alternarMenu() {
  menuAbierto.value = !menuAbierto.value;
}

function cerrarMenu() {
  menuAbierto.value = false;
}

function verificarAncho() {
  esMovil.value = window.innerWidth < 768;
  if (!esMovil.value) menuAbierto.value = false;
}

function manejarScroll() {
  headerReducido.value = window.scrollY > 80;
}

async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: route.fullPath,
  });
}

onMounted(() => {
  verificarAncho();
  window.addEventListener('resize', verificarAncho);
  window.addEventListener('scroll', manejarScroll);
});

onUnmounted(() => {
  window.removeEventListener('resize', verificarAncho);
  window.removeEventListener('scroll', manejarScroll);
});
</script>

<template>
  <header class="idegeo-header" :class="{ 'idegeo-header--compact': headerReducido }">
    <div class="idegeo-header__inner">
      <!-- Logos -->
      <div class="idegeo-header__logos">
        <NuxtLink
          to="/"
          class="idegeo-header__logo-link"
          aria-label="IDEGeo inicio"
          @click="cerrarMenu"
        >
          <img
            :src="`${config.app.baseURL}img/logo_centrogeo_wide_idegeo.png`"
            alt="CentroGeo - IDEGeo"
            class="idegeo-header__logo-img"
          />
        </NuxtLink>
      </div>

      <!-- Botón hamburguesa -->
      <button
        class="idegeo-nav-toggle"
        :class="{ 'is-open': menuAbierto }"
        type="button"
        :aria-expanded="menuAbierto"
        aria-controls="idegeo-main-menu"
        aria-label="Abrir menú"
        @click="alternarMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Menú de navegación -->
      <nav
        id="idegeo-main-menu"
        class="idegeo-menu"
        :class="{ 'is-open': menuAbierto }"
        aria-label="Menú principal"
      >
        <NuxtLink
          v-if="mostrarInicio"
          to="/"
          class="idegeo-menu__link"
          exact-path
          @click="cerrarMenu"
        >
          Inicio
        </NuxtLink>

        <NuxtLink
          to="https://centrogeo.org.mx/coordinacion-de-vinculacion/plataforma-de-informacion-geoespacial"
          external="true"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Plataforma IDEGeo
        </NuxtLink>

        <NuxtLink
          v-if="mostrarCatalogo"
          to="/catalogo"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Catálogo
        </NuxtLink>

        <NuxtLink
          v-if="mostrarConsulta"
          to="/consulta"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Consulta
        </NuxtLink>

        <NuxtLink
          v-if="mostrarIaa && status === 'authenticated'"
          to="/ia"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Análisis Inteligencia Artificial
        </NuxtLink>

        <NuxtLink
          v-if="mostrarLevantamiento && status === 'authenticated'"
          to="/levantamiento"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Levantamiento
        </NuxtLink>

        <NuxtLink
          v-if="mostrarGeocontenidos"
          to="/geocontenidos"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Geocontenidos
        </NuxtLink>

        <NuxtLink
          v-if="mostrarAcercaDe"
          to="/acerca-de"
          class="idegeo-menu__link"
          @click="cerrarMenu"
        >
          Acerca de
        </NuxtLink>

        <!-- Autenticación -->
        <template v-if="mostrarAuth">
          <NuxtLink
            v-if="status === 'authenticated'"
            to="/mi-cuenta"
            class="idegeo-menu__link"
            @click="cerrarMenu"
          >
            Mi cuenta
          </NuxtLink>
          <button
            v-else
            type="button"
            class="idegeo-menu__btn"
            aria-label="Iniciar sesión"
            @click="iniciarSesion"
          >
            Iniciar sesión
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
$color-theme: #db1631;
$color-accent: #ffd300;
$color-accent-hover: #ff6c22;
$header-bg: #ffffff;
$text-dark: #151414;

.idegeo-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: $header-bg;
  padding: 0 30px;
  transition:
    padding 0.3s,
    box-shadow 0.3s;

  &--compact {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .idegeo-header__logo-img {
      height: 40px;
    }
  }

  &__inner {
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
  }

  &__logos {
    display: flex;
    align-items: center;
  }

  &__logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  &__logo-img {
    height: 50px;
    width: auto;
    min-width: 14rem;
    padding: 5px 0;
    transition: height 0.3s;
  }
}

/* ── Menú ── */
.idegeo-menu {
  display: flex;
  align-items: center;
  gap: 0;

  &__link {
    color: $text-dark;
    text-decoration: none;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 0.92rem;
    padding: 0.6rem 1rem;
    border-bottom: 2px solid transparent;
    transition:
      border-color 0.2s,
      color 0.2s;
    white-space: nowrap;

    &:hover,
    &:focus {
      border-bottom-color: $color-accent-hover;
      color: $text-dark;
    }

    &.router-link-active,
    &.router-link-exact-active {
      border-bottom-color: $color-theme;
      color: $color-theme;
      font-weight: 500;
    }
  }

  &__btn {
    font-family: 'Montserrat', sans-serif;
    font-weight: 500;
    font-size: 0.85rem;
    color: #fff;
    background: $color-theme;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.5rem;
    transition: background 0.2s;
    white-space: nowrap;

    &:hover,
    &:focus {
      background: color-mix(in srgb, $color-theme, black 8%);
    }
  }
}

/* ── Botón hamburguesa ── */
.idegeo-nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 95;

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: $text-dark;
    border-radius: 2px;
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &.is-open {
    span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
}

/* ── Responsive ── */
@media (max-width: 1400px) {
  .idegeo-nav-toggle {
    display: flex;
  }

  .idegeo-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: $header-bg;
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem 1.5rem 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &.is-open {
      display: flex;
    }

    &__link {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

      &:hover,
      &:focus {
        border-bottom-color: $color-accent-hover;
      }
    }

    &__btn {
      margin: 0.5rem 0 0 0;
      text-align: center;
    }
  }
}
</style>
