<template>
  <nav class="menu-lateral">
    <div class="menu-lateral-contenedor">
      <h4 class="m-0 p-4">Catálogo de información</h4>
      <ul>
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
        <li>
          <nuxt-link to="/catalogo/mis-archivos">Mis archivos</nuxt-link>
          <ul>
            <li>
              <nuxt-link to="/catalogo/mis-archivos/carga-archivos">Carga de archivos</nuxt-link>
            </li>
            <li>
              <!-- TODO: verificar si existen servicios remotos -->
              <nuxt-link
                :to="`${true ? '/catalogo/mis-archivos/servicios-externos' : '/catalogo/mis-archivos/servicios-cargados'}`"
                >Servicios externos</nuxt-link
              >
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss">
.menu-lateral .menu-lateral-contenedor {
  padding: 0;
}
</style>
