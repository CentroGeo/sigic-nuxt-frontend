<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const modalCompartir = ref(null);
function abrirModalCompartir() {
  modalCompartir.value?.abrirModal();
}
const route = useRoute()
const config = useRuntimeConfig()
const origin = config.public.domain
const currentPath = computed(() => origin + route.fullPath)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentPath.value)
    alert('Enlace copiado al portapapeles.')
  } catch (err) {
    console.error('Error al copiar: ', err)
  }
}

useHead(() => ({
  meta: [
    { property: 'og:url', content: currentPath.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: 'SIGIC' },
    { property: 'og:title', content: 'Esta es la descripcion' },
    { property: 'og:image', content: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg' },
  ]
}));


const botonesEnlaces = computed(() => [
  {
    label: "X",
    pictogram: "pictograma-social-x",
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentPath.value)}`,
  },
  {
    label: "Facebook",
    pictogram: "pictograma-social-facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPath.value)}`
  },
  {
    label: "LinkedIn",
    pictogram: "pictograma-social-linkedin",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentPath.value)}`
  },
]);
defineExpose({
  abrirModalCompartir,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalCompartir">
      <template #encabezado>
        <h1>Compartir</h1>
      </template>

      <template #cuerpo>
        <div class="flex flex-contenido-alrededor">
          <div
            v-for="(boton, index) in botonesEnlaces"
            :key="`compartir-${index}`"
            class="flex contenedor-boton"
          >
            <div class="flex flex-contenido-centrado">
              <a
              class="boton-primario boton-pictograma boton-grande twitter-share-button"
              target="_blank"
              :href="boton.href"
              >
                <span :class="boton.pictogram" aria-hidden="true" />
              </a>
            </div>
            <div class="flex flex-contenido-centrado">
              {{ boton.label }}
            </div>
          </div> 
          <div>
            <div class="flex flex-contenido-centrado">
              <button
              type="button"
              class="boton-primario boton-pictograma boton-grande twitter-share-button"
              aria-label="Copiar vínculo al portapapeles"
              @click="copyToClipboard"
              >
                <span class="pictograma-enlace-subrayado" aria-hidden="true" />
              </button>
            </div>
            <div class="flex flex-contenido-centrado">
              <p>Enlace</p>
            </div>
          </div>
        </div>


        <div class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <p>
              Solo se compartirán las capas públicas. Si tu selección contiene
              capas de usuario, estas no se visualizarán de forma pública.
            </p>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.contenedor-boton {
  flex-direction: column;
}
.tarjeta {
  width: 99%;
  background-color: var(--color-alerta-1);
  border: 1px solid var(--color-alerta-3);
  p {
    color: var(--color-alerta-3);
  }
}
</style>
