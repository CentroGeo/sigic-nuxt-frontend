<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { useRouter } from 'vue-router';
import { formatDate } from '~/utils/levantamiento';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();
const router = useRouter();

const { data } = useAuth();
const route = useRoute();

const proyecto = ref(null);
const preguntas = ref([]);
const fechaParseada = ref('');

watch(
  [() => data.value?.user?.email, () => route.params.id],
  async ([email, id]) => {
    if (!import.meta.client) return;

    if (!email || !id) return;

    try {
      const res = await storeLevantamiento.obtenerProyectoPorId(email, id);
      proyecto.value = res;

      if (!proyecto.value) return;

      preguntas.value = proyecto.value.ficha_proyecto ?? [];

      const raw = proyecto.value?.fecha_creacion;

      const d = raw ? new Date(raw) : null;

      if (!d || Number.isNaN(d.getTime())) {
        console.warn('Fecha inválida tras parseo:', raw);
        fechaParseada.value = '';
        return;
      }

      try {
        fechaParseada.value = formatDate(d);
      } catch (e) {
        console.error('formatDate falló con Date:', d, 'raw:', raw, e);
        fechaParseada.value = '';
      }
    } catch (error) {
      console.error('Error en watcher:', error);
    }
  },
  { immediate: true }
);

function irAProyectosRechazados() {
  router.push('/levantamiento/revision-proyectos/rechazados');
}

const modalComentarios = ref(null);
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
                @click="irAProyectosRechazados"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Proyectos rechazados
            </div>
          </div>
          <div class="flex">
            <p
              class="borde borde-redondeado-12 p-x-1 p-y-minimo fondo-color-error texto-color-error borde-color-error m-0"
            >
              Rechazado
            </p>
            <button
              class="boton boton-secundario boton-chico fondo-color-primario"
              type="button"
              @click="modalComentarios.abrirModal()"
            >
              Ver comentarios
            </button>
          </div>
        </div>
        <div class="flex p-6 fondo-color-acento">
          <div class="flex p-3 fondo-color-primario borde-redondeado-20 columna-16">
            <div class="m-b-2 texto-tamanio-5">Información del proyecto</div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Nombre del proyecto:</div>
              <div class="columna-8">
                {{ proyecto?.nombre }}
              </div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Institución:</div>
              <div class="columna-8">{{ proyecto?.institucion }}</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Autor:</div>
              <div class="columna-8">{{ proyecto?.lider }}</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-8 texto-color-secundario">Fecha de creación:</div>
              <div class="columna-8">{{ fechaParseada }}</div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-16 texto-color-secundario">Objetivo del proyecto:</div>
              <div class="columna-16">
                {{ proyecto?.objetivo }}
              </div>
            </div>
            <div class="columna-16 flex">
              <div class="columna-16 texto-color-secundario">Instrucciones del formulario:</div>
              <div class="columna-16">
                {{ proyecto?.institucion }}
              </div>
            </div>
          </div>
          <div class="columna-16 texto-tamanio-4 texto-color-acento flex flex-contenido-centrado">
            Formulario del proyecto
          </div>

          <div v-for="(pregunta, index) in preguntas" :key="index" class="columna-16">
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
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalComentarios">
          <template #encabezado><h3>Comentarios</h3></template>
          <template #cuerpo>
            <p>El proyecto fue rechazado por los siguientes motivos:</p>
            <div class="fondo-color-error p-x-2 p-y-1 borde borde-color-error borde-redondeado-20">
              <p class="texto-color-error">
                {{ proyecto?.comentario_curador }}
              </p>
            </div>
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
</style>
