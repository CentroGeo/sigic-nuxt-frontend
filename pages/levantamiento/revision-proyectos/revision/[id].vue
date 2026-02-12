<script setup>
import { useRouter } from 'vue-router';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();
const router = useRouter();

function irAProyectosEnRevision() {
  router.push('/levantamiento/revision-proyectos/revision');
}
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="mis-proyectos-levantamiento contenedor m-b-10 m-t-3">
        <div class="flex flex-contenido-separado m-b-3">
          <div class="flex regresar mis-proyectos-encabezado">
            <div class="boton-regresar">
              <button
                class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
                aria-label="Regresar a proyectos"
                type="button"
                @click="irAProyectosEnRevision"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Proyectos en revisión
            </div>
          </div>
          <div class="flex">
            <button class="boton boton-primario boton-chico" type="button">Aceptar</button>
            <button class="boton boton-primario boton-chico" type="button">Rechazar</button>
          </div>
        </div>
        <div class="flex p-6 fondo-color-acento">
          <div class="flex p-3 fondo-color-primario borde-redondeado-20 columna-16">
            <div class="m-b-2 texto-tamanio-5">Información del proyecto</div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Nombre del proyecto:</div>
              <div class="columna-8">
                Registro de arte urbano en la Ciudad de Mérida, Yucatán (2025)
              </div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Institución:</div>
              <div class="columna-8">Dirección de Cultura</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Autor:</div>
              <div class="columna-8">Daniela Acuña</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Fecha de creación:</div>
              <div class="columna-8">2/12/2025</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-16 texto-color-secundario">Objetivo del proyecto:</div>
              <div class="columna-16">
                Generar un inventario actualizado de murales, grafitis y expresiones de arte urbano
                en espacios públicos, con el fin de documentar su ubicación, estado y valor
                cultural, además de fomentar la participación ciudadana en la conservación del
                patrimonio artístico contemporáneo.
              </div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-16 texto-color-secundario">Instrucciones del formulario:</div>
              <div class="columna-16">
                1. Subir una fotografía clara del mural o pieza de arte urbano.<br />
                2. Señalar el tipo de obra (mural, grafiti, stencil, instalación temporal, otro).<br />
                3. Reportar estado de conservación (bueno, regular, deteriorado).<br />
                4. Compartir, si se conoce, el nombre del artista o colectivo.<br />
                5. Añadir observaciones (ejemplo: si la obra tiene temática social, cultural,
                ambiental).
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style scoped lang="scss">
.regresar {
  &.mis-proyectos-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;

    .boton-regresar {
      display: flex;
      align-items: center;
      font-size: var(--Tipos-Tamao-Prrafos-Texto-alto, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: var(--Tipos-Interlineado-Prrafos-Texto-alto, 30px);
    }
  }
}

.menu-proyectos {
  flex: 1;
}
.boton-guardar-cambios-proyecto {
  align-self: center;
}

.mis-proyectos-levantamiento {
  display: flex;
  flex-direction: column;
}

.mis-proyectos-contenedor {
  flex: 1;
}
</style>
