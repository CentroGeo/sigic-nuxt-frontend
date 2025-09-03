<script setup>
const { status } = useAuth();
const estaLogueado = computed(() => status.value === 'authenticated');
</script>
<template>
  <nav class="menu-lateral">
    <div class="menu-lateral-contenedor">
      <h4 class="m-0 p-4">Catálogo de información</h4>
      <ul class="lista-subpagina">
        <li>
          <nuxt-link to="/catalogo/explorar">Explorar</nuxt-link>
          <ul>
            <li>
              <nuxt-link to="/catalogo/capas">Capas geográficas</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/catalogo/tablas">Datos tabulados</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/catalogo/documentos">Documentos</nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-if="estaLogueado" class="lista-sesion">
        <li>
          <nuxt-link to="/catalogo/mis-archivos">Mis archivos</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/catalogo/mis-archivos/cargar-archivos">Carga de archivos</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/catalogo/mis-archivos/servicios-externos">Servicios externos</nuxt-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.menu-lateral .menu-lateral-contenedor {
  padding: 0;
  .lista-sesion {
    margin-top: 16px;
  }
}
</style>
