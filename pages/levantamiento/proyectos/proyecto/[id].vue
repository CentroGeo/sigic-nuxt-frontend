<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const storeLevantamiento = useLevantamientoStore();
const proyecto = computed(() => storeLevantamiento.obtenerProyectoPorId(route.params.id));

const preguntas = [
  {
    id: 1,
    tipo: 'abierta',
    pregunta: '¿Qué observaciones adicionales deseas compartir sobre este punto?',
    instrucciones:
      'Describe con tus palabras cualquier detalle relevante: tipo de residuos, frecuencia con la que se acumulan o si hay personas afectadas.',
    obligatorio: true,
  },
  {
    id: 2,
    tipo: 'unica',
    pregunta: '¿Qué tipo de residuos predominan en este punto?',
    instrucciones: 'Selecciona la opción que mejor describa el tipo de residuos observados.',
    obligatorio: true,
  },
  {
    id: 3,
    tipo: 'multiple',
    pregunta: '¿Qué factores crees que contribuyen a la acumulación de basura en este sitio?',
    instrucciones: 'Marca todas las opciones que apliquen',
    obligatorio: true,
  },
  {
    id: 4,
    tipo: 'condicional',
    pregunta: '¿Has reportado anteriormente este punto a las autoridades?',
    instrucciones: '¿A qué dependencia o programa hiciste el reporte y cuándo?',
    obligatorio: true,
  },
  {
    id: 5,
    tipo: 'multimedia',
    pregunta: '',
    instrucciones:
      'Adjunta hasta cuatro fotos donde se aprecie claramente el lugar y los residuos. (Formatos permitidos: JPG, PNG, máximo 5 MB)',
    obligatorio: false,
  },
];

const modalSolicitarDescarga = ref(null);

function irAProyectosPublicos() {
  router.push('/levantamiento/proyectos/');
}
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="mis-proyectos-levantamiento contenedor m-b-10 m-t-3">
        <div class="grid m-b-3">
          <div class="columna-16 flex regresar mis-proyectos-encabezado">
            <div class="boton-regresar">
              <button
                class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
                aria-label="Regresar a proyectos"
                type="button"
                @click="irAProyectosPublicos"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Proyectos públicos
            </div>
          </div>
        </div>
        <h3 class="m-t-0 m-b-1">{{ proyecto?.nombre }}</h3>
        <div class="flex proyecto-encabezado texto-color-secundario m-b-3">
          <div
            class="p-x-1 p-y-minimo borde-redondeado-8 borde borde-color-acento fondo-color-acento"
          >
            Arte y cultura
          </div>
          <UiNumeroElementos :numero="proyecto?.aportes" etiqueta="Aportes" />
          <div>{{ proyecto?.institucion }}</div>
          <div>{{ proyecto?.autor }}</div>
        </div>
        <div class="contenedor">
          <div class="grid contenedor-formulario">
            <div class="columna-8 preguntas">
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Objetivo del proyecto:</h5>
                <p class="m-y-0">
                  Generar un inventario actualizado de murales, grafitis y expresiones de arte
                  urbano en espacios públicos, con el fin de documentar su ubicación, estado y valor
                  cultural, además de fomentar la participación ciudadana en la conservación del
                  patrimonio artístico contemporáneo.
                </p>
              </div>
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Instrucciones clave del formulario:</h5>
                <p class="m-y-0">
                  1. Subir una fotografía clara del mural o pieza de arte urbano. <br />
                  2. Señalar el tipo de obra (mural, grafiti, stencil, instalación temporal,
                  otro).<br />
                  3. Reportar estado de conservación (bueno, regular, deteriorado). <br />
                  4. Compartir, si se conoce, el nombre del artista o colectivo. <br />
                  5. Añadir observaciones (ejemplo: si la obra tiene temática social, cultural,
                  ambiental).
                </p>
              </div>
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Visualización de formulario</h5>
                <div class="fondo-color-neutro p-3 borde-redondeado-20 flex">
                  <div
                    v-for="pregunta in preguntas"
                    :key="pregunta.id"
                    class="p-3 borde-redondeado-20 fondo-color-primario columna-16"
                  >
                    <div v-if="pregunta.tipo !== 'multimedia'" class="m-b-2 texto-peso-500">
                      {{ pregunta.id }}. {{ pregunta.pregunta }}
                    </div>
                    <div class="m-b-1 texto-color-secundario texto-peso-500">
                      {{
                        pregunta.tipo === 'multimedia'
                          ? `${pregunta.id}. ${pregunta.instrucciones}`
                          : pregunta.instrucciones
                      }}
                    </div>

                    <div
                      v-if="pregunta.obligatorio"
                      class="texto-color-secundario texto-tamanio-2 text-peso-400"
                    >
                      Obligatoria*
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="columna-8 mapa">
              <ClientOnly>
                <SisdaiMapa
                  id="aportesmapa"
                  class="gema"
                  descripcion="Este mapa permite solicitar una descarga y crear un aporte"
                  :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
                >
                  <SisdaiCapaXyz />
                </SisdaiMapa>
              </ClientOnly>
              <div class="flex acciones-mapa">
                <button
                  class="boton-primario boton-chico"
                  @click="modalSolicitarDescarga.abrirModal()"
                >
                  Solicitar descarga
                  <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
                </button>
                <button class="boton-primario boton-chico boton-accion-aportar" type="button">
                  Aportar
                </button>
              </div>
            </div>
          </div>
        </div>

        <ClientOnly>
          <SisdaiModal ref="modalSolicitarDescarga">
            <template #encabezado><h3>Descargar datos</h3></template>
            <template #cuerpo>
              <SisdaiAreaTexto
                etiqueta="Describe el uso que le darás a los datos"
                ejemplo="Describe el uso que le darás a los datos..."
                :es_etiqueta_visible="true"
                :es_obligatorio="false"
                class="m-b-3"
              />
              <p class="m-t-0 m-b-3">
                Selecciona el formato en el cual deseas descargar los datos:
              </p>
              <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  etiqueta="Tabulado de datos .csv"
                  value="csv"
                  name="modo-descarga"
                />
                <SisdaiBotonRadio
                  etiqueta="Geopaquete .gpkg"
                  value="geopaquete"
                  name="modo-descarga"
                />
              </SisdaiBotonesRadioGrupo>
            </template>
            <template #pie>
              <button
                type="button"
                class="boton-secundario boton-chico"
                @click="modalSolicitarDescarga?.cerrarModal()"
              >
                Cerrar
              </button>
              <button type="button" class="boton-primario boton-chico">Solicitar descarga</button>
            </template>
          </SisdaiModal>
        </ClientOnly>
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

.proyecto-encabezado {
  align-items: center;
}

.texto-peso-500 {
  font-weight: 500;
}

.texto-peso-400 {
  font-weight: 400;
}

.contenedor-formulario {
  height: 60vh;
  overflow: hidden;

  .columna-8.preguntas {
    overflow: auto;
  }

  .columna-8.mapa {
    height: 100%;
    position: relative;

    .acciones-mapa {
      position: absolute;
      bottom: 24px;
      right: 26px;

      .boton-accion-aportar {
        width: 143px;
        justify-content: center;
      }
    }
  }
}
</style>
