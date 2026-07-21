<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { wait } from '~/utils/consulta';

const config = useRuntimeConfig();
const modalCompartir = ref(null);
const route = useRoute();
const currentPath = computed(() => config.public.baseURL + route.fullPath);
const linkStatus = ref(false);
const mensaje_copiar = ref('');

async function copyToClipboard(valor = currentPath.value, mensaje = 'Enlace copiado con éxito') {
  try {
    await navigator.clipboard.writeText(valor);
    mensaje_copiar.value = mensaje;
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

const codigo_iframe = `<iframe width="560" height="315" src="${currentPath.value.replace(route.path, '/iframe-mapa')}" frameborder="0"></iframe>`;
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
                @click="() => copyToClipboard()"
              >
                <span class="pictograma-enlace-subrayado" aria-hidden="true" />
              </button>
            </div>
            <div class="flex flex-contenido-centrado">
              <p>Enlace</p>
            </div>
          </div>
        </div>

        <div class="codigo-embebido-contenedor">
          <p class="m-t-0">Insertar este mapa</p>

          <div class="codigo-embebido">
            <button
              class="boton-primario boton-pictograma boton-grande"
              aria-label="Copiar código al portapapeles"
              @click="() => copyToClipboard(codigo_iframe, 'Código copiado con éxito')"
            >
              <span class="pictograma-copiar" aria-hidden="true" />
            </button>
            <code>{{ codigo_iframe }}</code>
          </div>
        </div>

        <div v-if="linkStatus" class="m-y-1 borde-redondeado-8 contenedor-alerta">
          <span class="pictograma-aprobado" /> {{ mensaje_copiar }}
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

.codigo-embebido-contenedor {
  .codigo-embebido {
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: row-reverse;
    gap: 16px;

    code {
      white-space: nowrap;
      flex-grow: 1;
      overflow-y: auto;
    }
  }
}

.contenedor-alerta {
  position: absolute;
  top: -48px;
  left: 20%;
  background-color: var(--color-neutro-4);
  color: var(--color-neutro-1);
  padding: 0 8px;
  width: max-content;
}
</style>
