<script setup>
const props = defineProps({
  sitio: {
    type: Object,
    required: true,
  },
});

const mostrarHeader = computed(() => props.sitio.configuration?.show_header !== false);

const estiloHeader = computed(() => {
  const config = props.sitio.configuration;
  if (!config) return {};
  return {
    backgroundColor: config.header_background_color || undefined,
    color: config.header_text_color || undefined,
    fontSize: config.header_font_size ? `${config.header_font_size}px` : undefined,
  };
});
</script>

<template>
  <header v-if="mostrarHeader" class="tablero-encabezado" :style="estiloHeader">
    <div class="tablero-encabezado__contenido">
      <div class="tablero-encabezado__texto">
        <h1 class="tablero-encabezado__titulo">{{ sitio.title }}</h1>
        <p v-if="sitio.subtitle" class="tablero-encabezado__subtitulo">{{ sitio.subtitle }}</p>
      </div>

      <div v-if="sitio.logos?.length" class="tablero-encabezado__logos">
        <a
          v-for="logo in sitio.logos"
          :key="logo.id"
          :href="logo.icon_link || undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="tablero-encabezado__logo"
        >
          <img :src="logo.icon" :alt="`Logo ${sitio.name}`" />
        </a>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.tablero-encabezado {
  padding: 1.5rem 2rem;

  &__contenido {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
    gap: 2rem;
  }

  &__titulo {
    margin: 0;
    font-size: inherit;
    line-height: 1.2;
  }

  &__subtitulo {
    margin: 0.25rem 0 0;
    opacity: 0.85;
    font-size: 0.875em;
  }

  &__logos {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  &__logo img {
    max-height: 48px;
    width: auto;
  }
}
</style>
