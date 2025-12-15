<script setup>
const route = useRoute();
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
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.menu-lateral .menu-lateral-contenedor {
  padding: 0;
}
</style>
