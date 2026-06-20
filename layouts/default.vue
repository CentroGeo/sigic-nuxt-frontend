<script setup>
/**
 * Layout principal con identidad IDEGeo.
 *
 * Reemplaza:
 * - SisdaiNavegacionGobMx → IdegeoBarraSuperior
 * - SisdaiNavegacionPrincipal + MainNavegacion → IdegeoNavegacionPrincipal
 * - SisdaiPiePaginaGobMx → IdegeoPiePagina
 *
 * Mantiene:
 * - SisdaiMenuAccesibilidad (funcionalidad de accesibilidad intacta)
 */
import SisdaiMenuAccesibilidad from '@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue';
import IdegeoBarraSuperior from '~/components/base/IdegeoBarraSuperior.vue';
import IdegeoNavegacionPrincipal from '~/components/base/IdegeoNavegacionPrincipal.vue';
import IdegeoPiePagina from '~/components/base/IdegeoPiePagina.vue';
import { useAccesibilidadStore } from '~/stores/accesibilidad';

const accesibilidadStore = useAccesibilidadStore();
const route = useRoute();
const currentPath = computed(() => route.fullPath);

useHead(() => ({
  meta: [
    { property: 'og:url', content: currentPath.value, key: 'og-url' },
    { name: 'twitter:url', content: currentPath.value, key: 'twitter-url' },
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    },
  ],
}));
</script>

<template>
  <div>
    <a href="#principal" class="ir-contenido-principal"> Ir a contenido principal </a>

    <IdegeoBarraSuperior />
    <IdegeoNavegacionPrincipal />

    <div id="principal" class="contenido">
      <slot />
    </div>

    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" perfil-color="sigic" />
    </client-only>

    <IdegeoPiePagina />
  </div>
</template>
