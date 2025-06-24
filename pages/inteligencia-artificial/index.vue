<script setup></script>
<template>
  <main id="ia">
    <h2>Módulo de IA</h2>
    <p>
      Esta herramienta está diseñada para ayudarte a analizar información
      científica y territorial mediante inteligencia artificial. Puedes crear
      proyectos temáticos, cargar datos relevantes, hacer preguntas específicas
      y generar reportes automatizados.
    </p>
    <section id="proyectos">
      <div class="contenedor">
        <div class="flex flex-contenido-separado">
          <h3>Mis proyectos</h3>
          <button type="button" class="boton-primario">
            Crear nuevo proyecto
            <span class="pictograma-agregar" aria-hidden="true" />
          </button>
        </div>

        <div class="flex">
          <div class="columna-4">
            <div class="tarjeta tarjeta-horizontal">
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-etiqueta">
                  <button
                    class="boton-pictograma boton-sin-contenedor-primario"
                    aria-label="Editar"
                    type="button"
                  >
                    <span class="pictograma-editar" aria-hidden="true" />
                  </button>
                  <button
                    class="boton-pictograma boton-sin-contenedor-primario"
                    aria-label="Remover"
                    type="button"
                  >
                    <span class="pictograma-eliminar" aria-hidden="true" />
                  </button>
                </p>
                <p class="tarjeta-titulo">Agua de la región sureste</p>
                <p>4 fuentes</p>
              </div>
              <div class="tarjeta-pie">
                <NuxtLink
                  class="boton-pictograma boton-sin-contenedor-primario"
                  aria-label="Iniciar chat"
                  to="inteligencia-artificial/chat"
                >
                  <span class="pictograma-ayuda" aria-hidden="true" />
                  Iniciar chat
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
@media screen and (min-width: 768px) {
  .tarjeta-horizontal .tarjeta-cuerpo {
    padding-left: 24px;
  }
  .tarjeta-horizontal .tarjeta-pie {
    padding-left: 24px;
  }
}
</style>
