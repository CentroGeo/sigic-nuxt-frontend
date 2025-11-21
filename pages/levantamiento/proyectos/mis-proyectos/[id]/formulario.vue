<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeLevantamiento = useLevantamientoStore();

const tipoPreguntas = [
  { id: 'abierta', label: 'Pregunta abierta' },
  { id: 'unica', label: 'Opción única' },
  { id: 'multiple', label: 'Selección múltiple' },
  { id: 'condicional', label: 'Pregunta condicional' },
  { id: 'multimedia', label: 'Carga multimedia' },
];

const preguntas = ref([]);
const modalPrevisualizacion = ref(null);

const agregarPregunta = (tipo) => {
  const basePregunta = {
    tipo: tipo.id,
    etiqueta: tipo.label,
    instrucciones: '',
    obligatorio: true,
  };

  if (tipo.id === 'abierta') {
    preguntas.value.push({
      ...basePregunta,
      pregunta: '',
    });
  } else if (tipo.id === 'unica' || tipo.id === 'multiple') {
    preguntas.value.push({
      ...basePregunta,
      pregunta: '',
      opciones: ['', ''],
      otro: true,
    });
  } else if (tipo.id === 'condicional') {
    preguntas.value.push({
      ...basePregunta,
      pregunta: '',
      opciones: [
        { opcion: '', pregunta: '' },
        { opcion: '', pregunta: '' },
      ],
    });
  } else if (tipo.id === 'multimedia') {
    preguntas.value.push({
      ...basePregunta,
      tipoMultimedia: '',
    });
  }
};

function handleMoverPregunta({ indice, direccion }) {
  const arr = preguntas.value;
  if (direccion === 'arriba' && indice > 0) {
    [arr[indice - 1], arr[indice]] = [arr[indice], arr[indice - 1]];
  } else if (direccion === 'abajo' && indice < arr.length - 1) {
    [arr[indice + 1], arr[indice]] = [arr[indice], arr[indice + 1]];
  }

  preguntas.value = [...arr];
}
</script>

<template>
  <div
    v-if="!storeLevantamiento.existeFormulario"
    class="columna-8 texto-centrado fondo-color-acento p-2 borde-redondeado-8 contenido-formulario"
  >
    <span class="pictograma-documento pictograma-grande texto-color-acento"></span>
    <h6 class="m-t-0 m-b-1 texto-color-secundario">Diseña tu formulario</h6>
    <p class="m-t-0 m-b-1">
      Define las preguntas que las personas participantes responderán en campo o escritorio.
    </p>
    <div class="texto-centrado">
      <button
        class="boton-primario boton boton-chico"
        aria-label="Crear un formulario"
        @click="storeLevantamiento.alternarFormulario"
      >
        Crear un formulario
      </button>
    </div>
  </div>

  <div v-else class="columna-16">
    <div class="grid">
      <div class="columna-6 fondo-color-neutro borde-redondeado-20 p-3">
        <h6 class="m-t-0 m-b-1">Agregar pregunta</h6>
        <p class="m-t-0">
          Agrega tipos de entrada de información y define las preguntas e instrucciones
        </p>
        <div class="flex flex-vertical-centrado flex-contenido-centrado acciones-agregar-pregunta">
          <template v-for="tipo in tipoPreguntas" :key="tipo.id">
            <button
              class="boton-chico boton-secundario fondo-color-primario flex flex-contenido-separado"
              @click="agregarPregunta(tipo)"
            >
              {{ tipo.label }}
              <span class="pictograma-agregar" aria-hidden="true" />
            </button>
          </template>
        </div>
        <div class="flex flex-vertical-centrado m-t-3 acciones-agregar-pregunta">
          <button
            class="boton-primario boton boton-chico texto-centrado flex flex-contenido-centrado"
            aria-label="Previsualizar"
            @click="modalPrevisualizacion.abrirModal()"
          >
            Previsualizar
          </button>
          <button
            class="boton-secundario boton boton-chico fondo-color-primario flex flex-contenido-centrado"
            aria-label="Regresar"
          >
            Regresar
          </button>
        </div>
      </div>
      <div class="columna-10 fondo-color-acento borde-redondeado-20 p-3">
        <div v-for="(pregunta, index) in preguntas" :key="index">
          <levantamiento-pregunta-abierta
            v-if="pregunta.tipo === 'abierta'"
            :pregunta="pregunta"
            :es-edicion="true"
            :indice="index"
            @update:pregunta="preguntas[index] = $event"
            @eliminar="preguntas.splice($event, 1)"
            @mover="handleMoverPregunta"
          />
          <levantamiento-pregunta-unica
            v-if="pregunta.tipo === 'unica'"
            :pregunta="pregunta"
            :es-edicion="true"
            :indice="index"
            @update:pregunta="preguntas[index] = $event"
            @eliminar="preguntas.splice($event, 1)"
            @mover="handleMoverPregunta"
          />
          <levantamiento-pregunta-multiple
            v-if="pregunta.tipo === 'multiple'"
            :pregunta="pregunta"
            :es-edicion="true"
            :indice="index"
            @update:pregunta="preguntas[index] = $event"
            @eliminar="preguntas.splice($event, 1)"
            @mover="handleMoverPregunta"
          />
          <levantamiento-pregunta-condicional
            v-if="pregunta.tipo === 'condicional'"
            :pregunta="pregunta"
            :es-edicion="true"
            :indice="index"
            @update:pregunta="preguntas[index] = $event"
            @eliminar="preguntas.splice($event, 1)"
            @mover="handleMoverPregunta"
          />
          <levantamiento-pregunta-multimedia
            v-if="pregunta.tipo === 'multimedia'"
            :pregunta="pregunta"
            :es-edicion="true"
            :indice="index"
            @update:pregunta="preguntas[index] = $event"
            @eliminar="preguntas.splice($event, 1)"
            @mover="handleMoverPregunta"
          />
        </div>
      </div>
    </div>

    <ClientOnly>
      <SisdaiModal ref="modalPrevisualizacion" class="modal-previsualizacion">
        <template #encabezado> <h3>Visualización de formulario</h3> </template>
        <template #cuerpo>
          <div class="fondo-color-acento borde-redondeado-20 p-3">
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
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.contenido-formulario {
  align-self: center;
}

.boton-agregar-pregunta {
  align-items: center;
}

.acciones-agregar-pregunta {
  gap: 8px;
}

.modal-previsualizacion {
  max-width: 40%;
}
</style>

<style lang="scss">
.modulo-levantamiento {
  dialog.modal {
    overflow: visible !important;
    max-height: none !important;
  }

  .modal-cuerpo {
    overflow-y: auto !important;
    max-height: 60vh !important;
  }
}
</style>
