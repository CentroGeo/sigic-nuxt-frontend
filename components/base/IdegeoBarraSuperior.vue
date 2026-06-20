<script setup>
/**
 * IdegeoBarraSuperior.vue
 * Barra superior institucional — reemplaza SisdaiNavegacionGobMx.
 *
 * Barra oscura con enlaces secundarios institucionales.
 * Equivale al #menu-two del sitio original de IDEGeo.
 */
import { ref } from 'vue';

defineProps({
  // Enlaces de la barra superior
  enlaces: {
    type: Array,
    default: () => [
      { texto: 'CentroGeo', href: 'https://www.centrogeo.org.mx/', externo: true },
      { texto: 'GeoINT', href: '#', externo: true },
    ],
  },
  // Ancho en px a partir del cual colapsa
  anchoNavegacion: {
    type: Number,
    default: 768,
  },
});

const esVisible = ref(true);
</script>

<template>
  <div v-if="esVisible" class="idegeo-barra-superior" aria-label="Barra superior institucional">
    <div class="idegeo-barra-superior__inner">
      <nav class="idegeo-barra-superior__links" aria-label="Enlaces institucionales">
        <a
          v-for="enlace in enlaces"
          :key="enlace.texto"
          :href="enlace.href"
          :target="enlace.externo ? '_blank' : undefined"
          :rel="enlace.externo ? 'noopener noreferrer' : undefined"
        >
          {{ enlace.texto }}
        </a>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$bg-dark: #333;
$text-color: #ddd;

.idegeo-barra-superior {
  background: $bg-dark;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  position: relative;
  z-index: 100;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 3rem;
  }

  &__links {
    display: flex;
    gap: 1.25rem;

    a {
      color: $text-color;
      text-decoration: none;
      font-weight: 400;
      font-size: 0.82rem;
      transition: color 0.2s;
      padding: 0 0.5em;
      line-height: 3rem;

      &:hover,
      &:focus {
        color: #fff;
      }
    }
  }
}

@media (max-width: 768px) {
  .idegeo-barra-superior {
    &__inner {
      height: 2.5rem;
    }

    &__links a {
      font-size: 0.75rem;
      line-height: 2.5rem;
    }
  }
}
</style>
