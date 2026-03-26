<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

// import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { SisdaiCapaVectorial, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const router = useRouter();
const route = useRoute();

const title = computed(() => route.query.title);
const previous_path = computed(() => route.query.previous_path);

const editarUbicaAporte = ref(true);

const rutaAnterior = ref('');
/**
 * Obtiene la ruta anterior y la procesa para devolver
 * @returns {String} con el nombre de la vista anterior
 */
function obtenerRutaAnterior() {
  // se divide la ruta por / y se toma el tercer índice
  rutaAnterior.value = route.query.previous_path.split('/', 4)[3];
  if (rutaAnterior.value === undefined) {
    // si es indefinido no tiene tercer índice
    return 'aprobados';
  } else {
    if (rutaAnterior.value === 'en-revision') {
      return 'en revisión';
    } else {
      return rutaAnterior.value.replace('-', ' ');
    }
  }
}
const modalRegresar = ref(null);

const aporte = ref({});

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

const preguntas = computed(() => {
  const ficha = aporte.value?.answers;

  return Array.isArray(ficha) ? ficha : [];
});

onMounted(async () => {
  aporte.value = await storeLevantamiento.obtenerAportePorId(route.params.id);
  const coordenadas = [aporte.value.longitud, aporte.value.latitud];

  const idAleatorio = generaIdAleatorio();

  punto.value.features = [
    {
      type: 'Feature',
      properties: { id: idAleatorio, img: 'url' },
      geometry: { type: 'Point', coordinates: coordenadas },
    },
  ];
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="m-t-4">
        <div class="contenedor">
          <div class="boton-regresar m-b-3">
            <button
              class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
              aria-label="Regresar a proyectos"
              type="button"
              @click="modalRegresar.abrirModal()"
            >
              <span class="pictograma-flecha-izquierda" aria-hidden="true" />
            </button>
            Aportes {{ obtenerRutaAnterior() }}
          </div>
          <h3 class="m-t-0 m-b-1">Editando aporte en:</h3>
          <h5 class="m-t-0 texto-color-secundario">{{ title }}</h5>
        </div>
        <div class="borde-b borde-color-secundario"></div>

        <div v-if="editarUbicaAporte" class="contenedor m-b-1">
          <div class="flex m-t-3">
            <div class="columna-6">
              <p class="m-t-0 m-b-1 texto-tamanio-5">1. Ubica tu aporte</p>
              <p class="m-t-0 m-b-3">
                Usa tu ubicación actual, escribe un lugar en el buscador o selecciona un punto en el
                mapa.
              </p>
              <button
                class="boton-primario boton-chico"
                type="button"
                @click="editarUbicaAporte = false"
              >
                Siguiente
              </button>
            </div>
            <div class="columna-10">
              <ClientOnly>
                <SisdaiMapa
                  id="aportesmapa"
                  class="gema"
                  style="height: 60vh; width: 100%"
                  descripcion="Este mapa permite seleccionar una ubicación y buscar un lugar en el buscador"
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
        </div>

        <div v-if="!editarUbicaAporte" class="contenedor m-b-3" style="overflow-y: hidden">
          <div class="flex m-t-3">
            <div class="columna-6">
              <p class="m-t-0 m-b-1 texto-tamanio-5">2. Completa el formulario</p>
              <p class="m-t-0 m-b-3">
                Completa la información solicitada relacionada con tu aporte.
              </p>
              <div class="m-b-2">
                <button class="boton-primario boton-chico m-r-2">Enviar a aprobación</button>
              </div>
              <div class="m-b-2">
                <button class="boton-secundario boton-chico">Guardar borrador</button>
              </div>
              <button
                class="boton-secundario boton-chico m-r-2"
                type="button"
                @click="editarUbicaAporte = true"
              >
                Regresar
              </button>
            </div>
            <div class="columna-10">
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalRegresar">
          <template #encabezado> <h2>Guardar cambios</h2> </template>
          <template #cuerpo>
            <p>¿Deseas guardar los cambios realizados en tu aporte y enviar de nuevo a revisión?</p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="router.push(previous_path)"
            >
              Regresar sin guardar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.boton-regresar {
  display: flex;
  align-items: center;
  font-size: var(--Tipos-Tamao-Prrafos-Texto-alto, 20px);
  font-style: normal;
  font-weight: 400;
  line-height: var(--Tipos-Interlineado-Prrafos-Texto-alto, 30px);
}
</style>
