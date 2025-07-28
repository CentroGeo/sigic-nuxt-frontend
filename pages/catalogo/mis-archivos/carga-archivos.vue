<script setup></script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <div class="alineacion-izquierda ancho-lectura">
          <h2>Carga archivo</h2>
          <p>
            <b>Solo archivos GeoJSON, Geopaquetes, CSV, XML, PDF, JPG y PNG.</b>
          </p>

          <ClientOnly>
            <CatalogoElementoDragNdDrop />
          </ClientOnly>

          <h2>Cargas pendientes</h2>
          <div>
            <div class="fondo-color-confirmacion p-2 borde-redondeado-16">
              <div class="flex texto-color-confirmacion">
                <span class="pictograma-aprobado" />
                <b> Archivo cargado correctamente </b>
              </div>

              <div class="texto-color-confirmacion">
                <p class="m-b-0">
                  Se detectaron 236 polígonos/líneas/puntos válidos
                </p>
                <p class="m-0">Sistema de referencia EPSG:4326</p>
              </div>

              <p>Capas_lago_texcoco.json</p>
              <div class="flex">
                <div class="columna-8">
                  <nuxt-link to="/catalogo/mis-archivos/editar-metadatos"
                    >Editar metadatos</nuxt-link
                  >
                </div>
                <div class="columna-8">
                  <nuxt-link to="/catalogo/mis-archivos/editar-estilo"
                    >Agrega un estilo (.sld)</nuxt-link
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
#identificadorUNICO {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
#identificadorUNICO + label {
  display: inline-block;
  cursor: pointer;
}
#identificadorUNICO:focus + label,
#identificadorUNICO + label:hover {
}
</style>
