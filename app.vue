<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@use '~/assets/global.scss';
.overflow-hidden {
  overflow: hidden;
}

// El dialog.modal tiene `inset: 0` (full-viewport) y sin overflow:hidden muestra
// su propio scrollbar además del de .modal-cuerpo → doble scrollbar.
dialog.modal {
  overflow: hidden;
}

// Cuando SisdaiModal abre, evitar que la página scrollee detrás del modal.
// Se cubre html, body y .contenido (el scroll-container del layout admin).
html:has(dialog[open]),
html:has(body.overflow-hidden) {
  overflow: hidden !important;
}
html:has(dialog[open]) body,
html:has(body.overflow-hidden) body {
  overflow: hidden !important;
}
html:has(dialog[open]) .contenido,
html:has(body.overflow-hidden) .contenido {
  overflow: hidden !important;
}
</style>
