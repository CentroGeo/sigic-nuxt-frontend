<script setup>
/**
 * IdegeoPiePagina.vue
 * Pie de página institucional IDEGeo — reemplaza SisdaiPiePaginaGobMx.
 *
 * Franja dorada superior, sección de contacto opcional,
 * logos CentroGeo + IDEGeo + GeoINT, y copyright.
 */

const config = useRuntimeConfig();

defineProps({
  /** Mostrar sección de contacto */
  mostrarContacto: {
    type: Boolean,
    default: true,
  },
  /** Datos de contacto */
  contactos: {
    type: Array,
    default: () => [
      {
        nombre: 'Oscar Gerardo Sánchez Siordia',
        correo: 'osanchez@centrogeo.edu.mx',
      },
      {
        nombre: 'Jesus Trujillo Almeida',
        correo: 'jtrujillo@centrogeo.edu.mx',
      },
    ],
  },
  /** Logos del footer */
  logos: {
    type: Array,
    default: () => [
      { src: 'logo_centrogeo_wide-white.png', alt: 'CentroGeo', width: '260px' },
      { src: 'logo_idegeo_wide-white_72px.png', alt: 'IDEGeo', width: '160px' },
      { src: 'geoint2_geoint_blanco.png', alt: 'GeoINT', width: '74px' },
    ],
  },
});
</script>

<template>
  <footer class="idegeo-footer">
    <!-- Franja dorada superior -->
    <div class="idegeo-footer__accent"></div>

    <!-- Sección de contacto (opcional) -->
    <section v-if="mostrarContacto" class="idegeo-footer__contacto">
      <div class="idegeo-footer__contacto-inner">
        <h3>Contáctanos</h3>
        <div class="idegeo-footer__contacto-grid">
          <div
            v-for="contacto in contactos"
            :key="contacto.correo"
            class="idegeo-footer__contacto-item"
          >
            <span class="idegeo-footer__contacto-nombre">{{ contacto.nombre }}</span>
            <a :href="`mailto:${contacto.correo}`" class="idegeo-footer__contacto-correo">
              {{ contacto.correo }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Logos y copyright -->
    <div class="idegeo-footer__bottom">
      <div class="idegeo-footer__bottom-inner">
        <div class="idegeo-footer__logos">
          <img
            v-for="logo in logos"
            :key="logo.alt"
            :src="`${config.app.baseURL}img/${logo.src}`"
            :alt="logo.alt"
            :style="{ width: logo.width }"
            class="idegeo-footer__logo-img"
          />
        </div>
        <p class="idegeo-footer__copyright">
          © {{ new Date().getFullYear() }} Centro de Investigación en Ciencias de Información
          Geoespacial, A.C.
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
$color-accent: #e5c743;
$bg-dark: #1a1919;
$bg-contacto: #000;
$text-light: rgba(255, 255, 255, 0.6);

.idegeo-footer {
  font-family: 'Montserrat', sans-serif;

  /* ── Franja de acento dorada ── */
  &__accent {
    height: 4px;
    background: $color-accent;
  }

  /* ── Sección de contacto ── */
  &__contacto {
    background: $bg-contacto;
    color: #fff;
    padding: 2.5rem 1.5rem;

    &-inner {
      max-width: 800px;
      margin: 0 auto;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1.25rem;
    }

    &-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    &-nombre {
      font-size: 1rem;
      font-weight: 400;
    }

    &-correo {
      color: #fff;
      text-decoration: none;
      font-size: 1rem;
      transition: text-decoration 0.2s;

      &:hover,
      &:focus {
        text-decoration: underline;
      }
    }
  }

  /* ── Bottom: logos + copyright ── */
  &__bottom {
    background: $bg-dark;
    padding: 2.5rem 1.5rem 2rem;

    &-inner {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
  }

  &__logos {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  &__logo-img {
    height: auto;
    max-height: 80px;
    object-fit: contain;
    opacity: 0.85;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  &__copyright {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 300;
    line-height: 1.4;
    color: $text-light;
  }
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .idegeo-footer {
    &__contacto {
      &-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }

    &__logos {
      gap: 1.25rem;

      img {
        max-width: 140px;
      }
    }
  }
}
</style>
