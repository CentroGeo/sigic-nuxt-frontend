<script setup>
import SisdaiMenuAccesibilidad from '@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue';
import SisdaiNavegacionGobMx from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-gob-mx/SisdaiNavegacionGobMx.vue';
import SisdaiPiePaginaGobMx from '@centrogeomx/sisdai-componentes/src/componentes/pie-pagina-gob-mx/SisdaiPiePaginaGobMx.vue';
import MainNavegacion from '~/components/base/MainNavegacion.vue';
import { useAccesibilidadStore } from '~/stores/accesibilidad';

const accesibilidadStore = useAccesibilidadStore();
const route = useRoute();
const currentPath = computed(() => route.fullPath);

useHead(() => ({
  meta: [
    { property: 'og:url', content: currentPath.value, key: 'og-url' },
    { name: 'twitter:url', content: currentPath.value, key: 'twitter-url' },
  ],
}));
</script>

<template>
  <div>
    <a href="#principal" class="ir-contenido-principal"> Ir a contenido principal </a>
    <SisdaiNavegacionGobMx />

    <MainNavegacion />

    <h1>Hola Mundo</h1>

    <div class="contenido">
      <slot />
    </div>

    <!-- parece que botón flotante agrega un id al elemento html que no
    coincide al hacer server side rendering -->
    <client-only>
      <SisdaiMenuAccesibilidad :objeto-store="accesibilidadStore" perfil-color="sigic" />
    </client-only>
    <SisdaiPiePaginaGobMx />
  </div>
</template>
