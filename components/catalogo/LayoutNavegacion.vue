<template>
  <div class="contenedor layout-navegacion">
    <h4 class="m-0 p-y-3">Catálogo de información</h4>
  </div>
  <nav class="menu-lateral abierto">
    <div class="menu-lateral-contenedor">
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
              <nuxt-link to="/catalogo/mis-archivos/carga-archivos"
                >Carga de archivos</nuxt-link
              >
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss">
.contenedor.layout-navegacion {
  background-color: var(--navegacion-secundaria-fondo);
}
nav.menu-lateral .menu-lateral-contenedor {
  height: 100%;
}
</style>
