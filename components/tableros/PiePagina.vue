<script setup>
const props = defineProps({
  sitio: {
    type: Object,
    required: true,
  },
});

const mostrarFooter = computed(() => props.sitio.configuration?.show_footer !== false);

const estiloFooter = computed(() => {
  const config = props.sitio.configuration;
  if (!config) return {};
  return {
    backgroundColor: config.site_background_color || undefined,
    color: config.site_text_color || undefined,
  };
});
</script>

<template>
  <footer v-if="mostrarFooter && sitio.info_text" class="tablero-footer" :style="estiloFooter">
    <div class="tablero-footer__contenido">
      <p>{{ sitio.info_text }}</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.tablero-footer {
  padding: 1.5rem 2rem;
  margin-top: 2rem;

  &__contenido {
    max-width: 1400px;
    margin: 0 auto;

    p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  }
}
</style>
