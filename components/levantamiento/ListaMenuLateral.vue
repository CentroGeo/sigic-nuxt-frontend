<script setup>
import { tieneRolAdministrador } from '~/utils/levantamiento';

const route = useRoute();
const { data } = useAuth();
const storeLevantamiento = useLevantamientoStore();

const esAdministradorLevantamiento = computed(() => tieneRolAdministrador(data.value?.accessToken));

onMounted(async () => {
  await storeLevantamiento.obtenerEsRevisor(data.value?.user.email);
});
</script>
<template>
  <nav class="menu-lateral">
    <div class="menu-lateral-contenedor">
      <h4 class="m-0 p-4">Explora y aporta</h4>
      <ul class="lista-subpagina">
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/levantamiento/proyectos/'
              ),
            }"
            to="/levantamiento/proyectos"
            >Proyectos</nuxt-link
          >
        </li>
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']:
                route.path.includes('/levantamiento/aportes/'),
            }"
            to="/levantamiento/aportes"
            >Aportes</nuxt-link
          >
        </li>
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/levantamiento/descargas/'
              ),
            }"
            to="/levantamiento/descargas"
            >Descargas</nuxt-link
          >
        </li>
      </ul>
      <ul
        v-if="storeLevantamiento.esRevisor"
        class="lista-subpagina"
        :class="{ revisor: storeLevantamiento.esRevisor }"
      >
        <li v-if="esAdministradorLevantamiento">
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/levantamiento/revision-proyectos'
              ),
            }"
            to="/levantamiento/revision-proyectos"
            >Revisión de proyectos</nuxt-link
          >
        </li>
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/levantamiento/revision-aportes'
              ),
            }"
            to="/levantamiento/revision-aportes"
            >Revisión de aportes</nuxt-link
          >
        </li>
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/levantamiento/revision-descargas'
              ),
            }"
            to="/levantamiento/revision-descargas"
            >Revisión de descargar</nuxt-link
          >
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.menu-lateral .menu-lateral-contenedor {
  padding: 0;

  .lista-subpagina.revisor {
    margin-top: 32px;
  }
}
</style>
