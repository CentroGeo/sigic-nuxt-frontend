<script setup></script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link
              to="/catalogo/mis-archivos"
              aria-label="regresar a mis archivos"
            >
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h2 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex">
            <div class="columna-16">
              <h2>nombre de la capa.json</h2>
              <div class="flex">
                <nuxt-link
                  to="/catalogo/mis-archivos/editar-metadatos"
                  exact-path
                  >Metadatos</nuxt-link
                >
                <nuxt-link to="/catalogo/mis-archivos/editar-estilo"
                  >Estilo</nuxt-link
                >
              </div>
              <h2>Estilo</h2>
              <p><b>Estilo, solo archivos .sld</b></p>
              <ClientOnly>
                <CatalogoElementoDragNdDrop />
              </ClientOnly>
            </div>

            <div class="flex">
              <div class="columna-16">
                <div class="fondo-color-neutro p-3 borde-redondeado-16">
                  <p>Nombre del estilo de la capa.sld</p>
                  <span class="pictograma-ayuda" />
                </div>
              </div>
              <div class="columna-16">
                <div class="fondo-color-confirmacion p-3 borde-redondeado-16">
                  <div class="flex texto-color-confirmacion">
                    <span class="pictograma-aprobado" />
                    <b> Archivo cargado correctamente </b>
                  </div>
                  <p>Nombre del estilo de la capa.sld</p>
                  <nuxt-link to="/catalogo/mis-archivos">
                    Ver en Mis archivos
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
