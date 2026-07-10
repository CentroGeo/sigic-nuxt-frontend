<script setup>
const props = defineProps({
  sitio: {
    type: Object,
    default: null,
  },
});

const topBar = computed(() => props.sitio?.top_bar);

const estilosBanda = computed(() => {
  if (!topBar.value) return {};
  return {
    backgroundColor: topBar.value.background_color || '#ffffff',
    color: topBar.value.text_color || '#333333',
    height: topBar.value.height ? `${topBar.value.height}px` : '60px',
  };
});
</script>

<template>
  <div v-if="topBar?.show" class="banda-institucional" :style="estilosBanda">
    <div class="banda-institucional__contenido">
      <p v-if="topBar.title" class="banda-institucional__titulo">
        {{ topBar.title }}
      </p>
      <div v-if="topBar.logos?.length" class="banda-institucional__logos">
        <a
          v-for="logo in topBar.logos"
          :key="logo.id"
          :href="logo.icon_link || undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="banda-institucional__logo"
        >
          <img :src="logo.icon || logo.icon_url" :alt="logo.alt_text || sitio?.name" />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banda-institucional {
  width: 100%;

  &__contenido {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    gap: 1.5rem;
  }

  &__titulo {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
  }

  &__logos {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-left: auto;
  }

  &__logo {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 6px;
    padding: 5px 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

    img {
      max-height: 36px;
      width: auto;
      object-fit: contain;
    }
  }
}
</style>
