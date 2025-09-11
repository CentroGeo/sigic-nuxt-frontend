<script setup></script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <h2>Carga catálogos externos</h2>

        <div class="ancho-fijo">
          <h3>Recursos cargados</h3>
          <form>
            <table>
              <thead>
                <tr>
                  <th>Nombre de servicio externo</th>
                  <th>Recursos exportados</th>
                  <th>Recursos pendientes</th>
                  <th>URL</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nombre de servicio externo</td>
                  <td><a href="#">1</a></td>
                  <td><a href="#">3</a></td>
                  <td>https://</td>
                  <td>ArcGIS REST MapServer</td>
                </tr>
              </tbody>
            </table>
            <div class="flex flex-contenido-inicio m-t-3">
              <nuxt-link
                class="boton boton-primario"
                aria-label="Ir a catálogo externo en mis archivos"
                to="/catalogo/mis-archivos"
                >Ver catálogo Externo en Mis Archivos</nuxt-link
              >
              <nuxt-link
                class="boton boton-secundario"
                aria-label="Agregar servicio remoto"
                to="/catalogo/servicios-remotos"
                >Agregar servicio remoto</nuxt-link
              >
            </div>
          </form>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
