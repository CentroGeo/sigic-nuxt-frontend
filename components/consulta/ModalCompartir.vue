<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { wait } from '~/utils/consulta';

const modalCompartir = ref(null);
const route = useRoute();
const config = useRuntimeConfig();
const baseUrl = config.public.baseURL;
const currentPath = computed(() => baseUrl + route.fullPath);
const linkStatus = ref(false);
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentPath.value);
    //alert('Enlace copiado al portapapeles: ' + currentPath.value);
    linkStatus.value = true;
    await wait(1000);
    linkStatus.value = false;
  } catch (err) {
    console.error('Error al copiar: ', err);
  }
}

function abrirModalCompartir() {
  linkStatus.value = false;
  modalCompartir.value?.abrirModal();
}

const botonesEnlaces = computed(() => [
  {
    label: 'X',
    pictogram: 'pictograma-social-x',
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentPath.value)}`,
  },
  {
    label: 'Facebook',
    pictogram: 'pictograma-social-facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPath.value)}`,
  },
  {
    label: 'LinkedIn',
    pictogram: 'pictograma-social-linkedin',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentPath.value)}`,
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
        <div class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <p>
              Solo se compartirán las capas públicas. Si tu selección contiene capas de usuario,
              estas no se visualizarán de forma pública.
            </p>
          </div>
        </div>

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
        <div v-if="linkStatus" class="m-y-1 borde-redondeado-8 contenedor-alerta">
          <span class="pictograma-aprobado"></span> Enlace copiado con éxito
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
.contenedor-alerta {
  position: absolute;
  top: -48px;
  left: 20%;
  background-color: var(--color-neutro-4);
  color: var(--color-neutro-1);
  padding: 0px 8px;
  width: max-content;
}
</style>
