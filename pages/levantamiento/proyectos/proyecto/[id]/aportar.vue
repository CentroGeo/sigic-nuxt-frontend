<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { SisdaiCapaVectorial, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const storeLevantamiento = useLevantamientoStore();
const { data } = useAuth();
const proyecto = ref(null);

watch(
  () => data.value?.user.email,
  async (email) => {
    if (!email) return;

    proyecto.value = await storeLevantamiento.obtenerProyectoPorId(email, route.params.id);
  },
  { immediate: true }
);

const preguntas = computed(() => {
  const ficha = proyecto.value?.ficha_proyecto;

  return Array.isArray(ficha) ? ficha : [];
});

function irAInformacionProyecto() {
  router.push(`/levantamiento/proyectos/proyecto/${route.params.id}`);
}

const punto = ref({
  type: 'FeatureCollection',
  features: [],
});

function generaIdAleatorio() {
  return 'point-id-' + Math.random().toString(36).substring(2);
}

function clickMarca({ coordenadas }) {
  const idAleatorio = generaIdAleatorio();

  punto.value.features = [
    {
      type: 'Feature',
      properties: { id: idAleatorio, img: 'url' },
      geometry: { type: 'Point', coordinates: coordenadas },
    },
  ];
}

const paso = ref(1);
const modalNoUbicacion = ref(null);

function irPaso2() {
  if (punto.value?.features?.length < 1) {
    modalNoUbicacion.value.abrirModal();
    return;
  }
  paso.value = 2;
}

function regresarPaso1() {
  paso.value = 1;
}

function continuarSinUbicacion() {
  modalNoUbicacion.value.cerrarModal();
  paso.value = 2;
}

const modalBorrador = ref(null);

async function guardarBorrador() {
  const aporte = {
    id_usuario: data.value?.user.email,
    id_proyecto: route.params.id,
    respuestas: preguntas.value,
    latitud: punto.value.features[0].geometry.coordinates[1],
    longitud: punto.value.features[0].geometry.coordinates[0],
    status: 'POR ENVIAR',
    titulo: proyecto.value.nombre,
  };

  await storeLevantamiento.guardarBorradorAporte(aporte);

  modalBorrador.value.abrirModal();
}

function irAProyectos() {
  router.push('/levantamiento/proyectos/');
}

function irAAportesPorEnviar() {
  router.push('/levantamiento/aportes/por-enviar/');
}

const imagenesPorPregunta = ref({});

function recibirImagenes({ indice, archivos }) {
  imagenesPorPregunta.value[indice] = archivos;
}

async function enviarAporte() {
  try {
    const formData = new FormData();

    formData.append('id_usuario', data.value?.user.email);
    formData.append('id_proyecto', route.params.id);
    formData.append('latitud', punto.value.features[0].geometry.coordinates[1]);
    formData.append('longitud', punto.value.features[0].geometry.coordinates[0]);
    formData.append('status', 'EN REVISION');
    formData.append('titulo', proyecto.value.nombre);

    const preguntasConMedia = JSON.parse(JSON.stringify(toRaw(preguntas.value)));

    Object.entries(imagenesPorPregunta.value).forEach(([indice, archivos]) => {
      if (!preguntasConMedia[indice]) return;

      preguntasConMedia[indice].media = [];

      archivos.forEach((archivo, i) => {
        const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const timestamp = Date.now();
        const nombre = `${route.params.id}_${indice}_${timestamp}_${i}.${extension}`;

        preguntasConMedia[indice].media.push(nombre);
        formData.append('media', archivo, nombre);
      });
    });

    formData.append('respuestas', JSON.stringify(preguntasConMedia));

    await storeLevantamiento.enviarAporte(formData);

    modalBorrador.value.abrirModal();
  } catch (error) {
    console.error('Error en enviarAporte:', error);
  }
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
                @click="irAInformacionProyecto"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Información del proyecto
            </div>
          </div>
        </div>
        <h3 class="m-t-0 m-b-1">Creando aporte en:</h3>
        <h5 class="m-t-0 texto-color-secundario">{{ proyecto?.nombre }}</h5>
        <div class="borde-b borde-color-secundario"></div>
        <div class="contenedor">
          <div v-if="paso === 1" class="grid contenedor-formulario">
            <div class="columna-6 preguntas p-t-3">
              <p class="m-t-0 m-b-1 texto-tamanio-5">1. Ubica tu aporte</p>
              <p class="m-t-0 m-b-3">
                Usa tu ubicación actual, escribe un lugar en el buscador o selecciona un punto en el
                mapa.
              </p>
              <button class="boton-primario boton-chico" @click="irPaso2">Siguiente</button>
            </div>
            <div class="columna-10 mapa">
              <ClientOnly>
                <SisdaiMapa
                  id="aportesmapa"
                  class="gema"
                  descripcion="Este mapa permite seleccionar una ubicación en el mapa"
                  :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
                  @click-marca="clickMarca"
                >
                  <SisdaiCapaXyz />
                  <SisdaiCapaVectorial
                    v-for="value in punto.features"
                    :id="`puntoss_${value.properties.id}`"
                    :key="value.properties.id"
                    :fuente="punto"
                    :estilo="{
                      'icono-anchura': 32,
                      'icono-altura': 32,
                      'icono-fuente': '/img/icono_ubicacion.svg',
                    }"
                  />
                </SisdaiMapa>
              </ClientOnly>
            </div>
          </div>

          <div v-if="paso === 2" class="grid contenedor-formulario">
            <div class="columna-6 preguntas p-t-3">
              <p class="m-t-0 m-b-1 texto-tamanio-5">2. Completa el formulario</p>
              <p class="m-t-0 m-b-3">
                Completa la información solicitada relacionada con tu aporte.
              </p>
              <div class="m-b-2">
                <button class="boton-primario boton-chico m-r-2" @click="enviarAporte">
                  Enviar a aprobación
                </button>
              </div>
              <!-- <p class="m-t-0 m-b-2 texto-tamanio-2 texto-color-error">
                *Aun no se han completado todas las preguntas obligatorias
              </p> -->
              <div class="m-b-2">
                <button class="boton-secundario boton-chico" @click="guardarBorrador">
                  Guardar borrador
                </button>
              </div>
              <div>
                <button class="boton-secundario boton-chico m-r-2" @click="regresarPaso1">
                  Regresar
                </button>
              </div>
            </div>

            <div class="columna-10 mapa formulario p-t-3">
              <div class="fondo-color-acento borde-redondeado-20 p-3">
                <div v-for="(pregunta, index) in preguntas" :key="index">
                  <levantamiento-pregunta-abierta
                    v-if="pregunta.tipo === 'abierta'"
                    :pregunta="pregunta"
                    :es-edicion="false"
                    :indice="index"
                    @update:pregunta="preguntas[index] = $event"
                  />
                  <levantamiento-pregunta-unica
                    v-if="pregunta.tipo === 'unica'"
                    :pregunta="pregunta"
                    :es-edicion="false"
                    :indice="index"
                    @update:pregunta="preguntas[index] = $event"
                  />
                  <levantamiento-pregunta-multiple
                    v-if="pregunta.tipo === 'multiple'"
                    :pregunta="pregunta"
                    :es-edicion="false"
                    :indice="index"
                    @update:pregunta="preguntas[index] = $event"
                  />
                  <levantamiento-pregunta-condicional
                    v-if="pregunta.tipo === 'condicional'"
                    :pregunta="pregunta"
                    :es-edicion="false"
                    :indice="index"
                    @update:pregunta="preguntas[index] = $event"
                  />
                  <levantamiento-pregunta-multimedia
                    v-if="pregunta.tipo === 'multimedia'"
                    :pregunta="pregunta"
                    :es-edicion="false"
                    :indice="index"
                    @guardar-imagenes="recibirImagenes"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalNoUbicacion">
          <template #encabezado><h3>Ubicación de aporte</h3></template>
          <template #cuerpo>
            <p class="m-t-0 m-b-3">
              No se seleccionó un punto en el mapa, se usará tu localización para ubicar tu aporte
              ¿Deseas continuar?
            </p>
          </template>
          <template #pie>
            <button
              type="button"
              class="boton-secundario boton-chico"
              @click="modalNoUbicacion.cerrarModal()"
            >
              Regresar
            </button>
            <button type="button" class="boton-primario boton-chico" @click="continuarSinUbicacion">
              Continuar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalBorrador">
          <template #encabezado><h3>Aporte guardado</h3></template>
          <template #cuerpo>
            <p class="m-t-0 m-b-3">
              Tu aporte se ha guardado correctamente, puedes retormarlo desde la sección "Aportes
              por enviar"
            </p>
          </template>
          <template #pie>
            <button type="button" class="boton-secundario boton-chico" @click="irAAportesPorEnviar">
              Ir a aportes por enviar
            </button>
            <button type="button" class="boton-primario boton-chico" @click="irAProyectos">
              Ir a proyectos
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
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

  .columna-6.preguntas {
    overflow: auto;
  }

  .columna-10.mapa {
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

    &.formulario {
      overflow: auto;
    }
  }
}
</style>
