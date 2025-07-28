<template>
  <div>
    <!-- https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator -->
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@use "~/assets/global.scss";
.overflow-hidden {
  overflow: hidden;
}
</style>
