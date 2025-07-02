<template>
  <div class="contenedor ancho-lectura">
    <div class="">
      <h2 class="texto-centrado">
        Analiza información con Inteligencia Artificial
      </h2>
      <div class="fondo-color-neutro p-2 borde-redondeado-8">
        <h6 class="m-t-0">Crea un proyecto para comenzar</h6>
        <p>
          Esta herramienta está diseñada para ayudarte a analizar información
          científica y territorial mediante chats con inteligencia artificial.
          Para iniciar, crea proyectos temáticos, agregar información del
          catálogo o subir tus propios archivos.
        </p>
      </div>
      <div class="texto-centrado m-t-3">
        <NuxtLink
          class="boton-pictograma boton-primario"
          aria-label="Crear nuevo proyecto"
          to="/ia/proyectos/crea-proyecto"
        >
          Crear proyecto
          <span class="pictograma-agregar" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
