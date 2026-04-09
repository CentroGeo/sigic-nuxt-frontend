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
            { texto: 'Aprobados', ruta: '/levantamiento/revision-aportes' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-aportes/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-aportes/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Aportes aprobados</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.aportesAprobados.length"
            etiqueta="Aportes"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenAportesAprobados"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">No has aprobado aportes</h6>
            <p class="m-t-0 m-b-1">Todos los aportes que apruebes aparecerán en esta sección.</p>
            <div class="texto-centrado">
              <button class="boton-primario boton-chico">Revisar aportes pendientes</button>
            </div>
          </div>
          <div class="columna-4"></div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.titulo-contenido-levantamiento {
  align-items: center;
}

.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}

.icono-proyecto {
  width: 40px;
  height: 40px;
}

.boton-accion-proyecto {
  width: 100%;
  justify-content: center;
}
</style>
