<script setup>
definePageMeta({
  middleware: 'auth',
});
const storeLevantamiento = useLevantamientoStore();
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="principal-levantamiento flex contenedor m-b-10 m-t-3">
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Proyectos públicos', ruta: '/levantamiento/proyectos' },
            {
              texto: 'Mis proyectos',
              ruta: '/levantamiento/proyectos/mis-proyectos',
              notificacion: false,
            },
            {
              texto: 'Proyectos compartidos',
              ruta: '/levantamiento/proyectos/proyectos-compartidos',
              notificacion: true,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento m-b-3">
          <h2>Mis proyectos</h2>
          <UiNumeroElementos :numero="0" etiqueta="Proyectos" />
        </div>
        <div class="flex texto-centrado contenido-levantamiento">
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-documento pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">
              Crea un proyecto y empieza a recibir aportes
            </h6>
            <p class="m-t-0 m-b-1">
              Define la información general de tu proyecto, decide quiénes participarán y diseña un
              formulario para empezar a recibir aportes
            </p>
            <div class="texto-centrado">
              <NuxtLink
                class="boton-primario boton-pictograma"
                aria-label="Crear nuevo proyecto"
                to="/levantamiento/proyectos/mis-proyectos/nuevo"
              >
                Crear un proyecto
                <span class="pictograma-agregar" aria-hidden="true" />
              </NuxtLink>
            </div>
          </div>
          <div class="columna-4"></div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}
.titulo-contenido-levantamiento {
  align-items: center;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}
</style>
