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

const preguntas = ref([
  {
    tipo: 'abierta',
    etiqueta: 'Pregunta abierta',
    pregunta: '¿Qué observaciones adicionales deseas compartir sobre este punto?',
    obligatorio: true,
    instrucciones:
      'Describe con tus palabras cualquier detalle relevante: tipo de residuos, frecuencia con la que se acumulan o si hay personas afectadas.',
  },
  {
    tipo: 'unica',
    etiqueta: 'Opción única',
    pregunta: '¿En qué momentos del día consideras que el riesgo es mayor?',
    opciones: ['Mañana', 'Tarde', 'Mediodía', 'Noche'],
    obligatorio: true,
    instrucciones: 'Selecciona la opción que mejor describa el tipo de residuos observados.',
  },
  {
    tipo: 'condicional',
    etiqueta: 'Pregunta condicional',
    pregunta: 'Has presenciado o vivido algún incidente en este cruce?',
    opciones: [
      {
        opcion: 'Si',
        subpregunta: { pregunta: 'Describe la situación' },
        tipoCondicion: 'abierta',
      },
      { opcion: 'No' },
    ],
    obligatorio: true,
    instrucciones: '',
  },
]);
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
          <div class="columna-16 texto-tamanio-4 texto-color-acento flex flex-contenido-centrado">
            Formulario del proyecto
          </div>
          <div class="">
            <div v-for="(pregunta, index) in preguntas" :key="index">
              <levantamiento-pregunta-abierta
                v-if="pregunta.tipo === 'abierta'"
                :pregunta="pregunta"
                :es-edicion="false"
                :indice="index"
              />
              <levantamiento-pregunta-unica
                v-if="pregunta.tipo === 'unica'"
                :pregunta="pregunta"
                :es-edicion="false"
                :indice="index"
              />
              <levantamiento-pregunta-multiple
                v-if="pregunta.tipo === 'multiple'"
                :pregunta="pregunta"
                :es-edicion="false"
                :indice="index"
              />
              <levantamiento-pregunta-condicional
                v-if="pregunta.tipo === 'condicional'"
                :pregunta="pregunta"
                :es-edicion="false"
                :indice="index"
              />
              <levantamiento-pregunta-multimedia
                v-if="pregunta.tipo === 'multimedia'"
                :pregunta="pregunta"
                :es-edicion="false"
                :indice="index"
              />
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
