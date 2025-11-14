<script setup>
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasilla from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';

const props = defineProps({
  pregunta: {
    type: Object,
    default: () => ({}),
  },
  esEdicion: { type: Boolean, default: false },
  indice: { type: Number, default: 0 },
});

const emit = defineEmits(['update:pregunta', 'eliminar', 'mover']);

function actualizarPregunta(campo, valor) {
  emit('update:pregunta', { ...props.pregunta, [campo]: valor });
}

function eliminarPregunta() {
  emit('eliminar', props.indice);
}

function subirPregunta() {
  emit('mover', { indice: props.indice, direccion: 'arriba' });
}

function bajarPregunta() {
  emit('mover', { indice: props.indice, direccion: 'abajo' });
}

function actualizarOpcion(indice, campo, valor) {
  const nuevasOpciones = [...props.pregunta.opciones];
  nuevasOpciones[indice] = { ...nuevasOpciones[indice], [campo]: valor };
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

function eliminarOpcion(indice) {
  const nuevasOpciones = [...props.pregunta.opciones];
  nuevasOpciones.splice(indice, 1);
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

function agregarOpcion() {
  const nuevasOpciones = [...props.pregunta.opciones, { opcion: '', pregunta: '' }];
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

function agregarCondicion(indice, tipo) {
  const nuevasOpciones = [...props.pregunta.opciones];
  const opcionActual = nuevasOpciones[indice];

  if (opcionActual.tipoCondicion === tipo) {
    opcionActual.tipoCondicion = '';
    opcionActual.subpregunta = null;
  } else {
    opcionActual.tipoCondicion = tipo;
    opcionActual.subpregunta =
      tipo === 'abierta'
        ? { pregunta: '', instrucciones: '' }
        : { pregunta: '', instrucciones: '', opciones: [] };
  }

  nuevasOpciones[indice] = { ...opcionActual };
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

const opcionSeleccionada = ref({});

function handleChangeRadio(e) {
  const selected = e.target.value;
  const optSelected = props.pregunta.opciones.find((opt) => opt.opcion === selected);
  console.log(optSelected);
  opcionSeleccionada.value = optSelected;
}
</script>

<template>
  <div class="p-3 fondo-color-primario borde-redondeado-20 m-b-2">
    <div v-if="esEdicion">
      <div class="flex flex-contenido-separado m-b-2">
        <div
          class="borde borde-color-acento borde-redondeado-8 p-x-1 p-y-minimo fondo-color-acento texto-color-secundario"
        >
          Pregunta condicional
        </div>
        <div>
          <button
            class="boton-pictograma boton-sin-contenedor-primario"
            aria-label="Subir pregunta"
            type="button"
            @click="subirPregunta"
          >
            <span class="pictograma-subir-capa" aria-hidden="true" />
          </button>
          <button
            class="boton-pictograma boton-sin-contenedor-primario"
            aria-label="Bajar pregunta"
            type="button"
            @click="bajarPregunta"
          >
            <span class="pictograma-bajar-capa" aria-hidden="true" />
          </button>
        </div>
      </div>
      <SisdaiCampoBase
        class="m-b-2"
        :etiqueta="`Pregunta ${props.indice + 1}`"
        ejemplo="Escribe una pregunta condicional"
        :es_etiqueta_visible="true"
        :model-value="props.pregunta.pregunta"
        @update:model-value="(valor) => actualizarPregunta('pregunta', valor)"
      />
      <SisdaiCampoBase
        class="m-b-2"
        etiqueta="Instrucciones"
        ejemplo="Escribe las instrucciones para la persona participante"
        :es_etiqueta_visible="true"
        :model-value="props.pregunta.instrucciones"
        @update:model-value="(valor) => actualizarPregunta('instrucciones', valor)"
      />
      <p class="borde-b borde-color-secundario" />
      <div class="flex m-b-2">
        <span class="texto-color-secundario">Opciones</span>
        <button
          class="boton-primario boton-chico boton-pictograma"
          aria-label="Agregar opcion"
          type="button"
          @click="agregarOpcion"
        >
          <span class="pictograma-agregar" aria-hidden="true" />
        </button>
      </div>
      <div v-for="(opcion, index) in props.pregunta.opciones" :key="index" class="m-b-2">
        <div class="flex flex-contenido-separado m-b-2">
          <SisdaiCampoBase
            class="input-opcion"
            :etiqueta="`Opción ${index + 1}`"
            :ejemplo="`Escribe la respuesta de la opción ${index + 1}`"
            :es_etiqueta_visible="true"
            :model-value="opcion.opcion"
            @update:model-value="(valor) => actualizarOpcion(index, 'opcion', valor)"
          />
          <button
            class="boton-secundario boton-grande boton-pictograma boton-eliminar-opcion"
            aria-label="Agregar opcion"
            type="button"
            @click="eliminarOpcion(index)"
          >
            <span class="pictograma-cerrar" aria-hidden="true" />
          </button>
        </div>
        <div class="grid">
          <div class="columna-5">
            <div>Agregar condición</div>
          </div>
          <div class="columna-11">
            <div class="flex m-b-2">
              <button
                class="boton-chico boton-secundario flex flex-contenido-separado"
                :class="
                  opcion.tipoCondicion === 'abierta' ? 'fondo-color-acento' : 'fondo-color-primario'
                "
                @click="agregarCondicion(index, 'abierta')"
              >
                Abierta
                <span class="pictograma-agregar" aria-hidden="true" />
              </button>
              <button
                class="boton-chico boton-secundario flex flex-contenido-separado"
                :class="
                  opcion.tipoCondicion === 'opcion' ? 'fondo-color-acento' : 'fondo-color-primario'
                "
                @click="agregarCondicion(index, 'opcion')"
              >
                De opción
                <span class="pictograma-agregar" aria-hidden="true" />
              </button>
            </div>
            <div v-if="opcion.tipoCondicion === 'abierta'">
              <levantamiento-subpregunta-abierta
                :pregunta="opcion.subpregunta"
                @update:pregunta="(valor) => actualizarOpcion(index, 'subpregunta', valor)"
              />
            </div>

            <div v-else-if="opcion.tipoCondicion === 'opcion'">
              <levantamiento-subpregunta-opcion
                :pregunta="opcion.subpregunta"
                @update:pregunta="(valor) => actualizarOpcion(index, 'subpregunta', valor)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex">
        <SisdaiCasilla
          etiqueta="Obligatorio"
          :model-value="props.pregunta.obligatorio"
          @update:model-value="(valor) => actualizarPregunta('obligatorio', valor)"
        />
        <button
          class="boton-secundario boton-chico"
          aria-label="Eliminar pregunta"
          @click="eliminarPregunta"
        >
          Eliminar pregunta <span class="pictograma-eliminar"></span>
        </button>
      </div>
    </div>
    <div v-else>
      <div class="m-b-2 texto-peso-500">{{ props.indice + 1 }}. {{ props.pregunta.pregunta }}</div>
      <div class="m-b-1 texto-color-secundario texto-peso-500">
        {{ props.pregunta.instrucciones }}
      </div>
      <p class="borde-b borde-color-secundario m-y-2" />
      <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
        <SisdaiBotonRadio
          v-for="(opcion, index) in props.pregunta.opciones"
          :key="index"
          :etiqueta="opcion.opcion"
          :value="opcion.opcion"
          name="opcion"
          @change="handleChangeRadio"
        />
      </SisdaiBotonesRadioGrupo>
      <p class="borde-b borde-color-secundario m-y-2" />
      <div v-if="opcionSeleccionada.tipoCondicion === 'abierta'">
        <div class="m-b-2 texto-peso-500">{{ opcionSeleccionada.subpregunta.pregunta }}</div>
        <div class="m-b-1 texto-color-secundario texto-peso-500">
          {{ opcionSeleccionada.subpregunta.instrucciones }}
        </div>
        <SisdaiCampoBase
          class="m-b-2"
          etiqueta="Respuesta"
          ejemplo="Responde la pregunta"
          :es_etiqueta_visible="false"
        />
      </div>
      <div v-if="opcionSeleccionada.tipoCondicion === 'opcion'">
        <div class="m-b-2 texto-peso-500">{{ opcionSeleccionada.subpregunta.pregunta }}</div>
        <div class="m-b-1 texto-color-secundario texto-peso-500">
          {{ opcionSeleccionada.subpregunta.instrucciones }}
        </div>
        <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
          <SisdaiBotonRadio
            v-for="(opcion, index) in opcionSeleccionada.subpregunta.opciones"
            :key="index"
            :etiqueta="opcion"
            :value="opcion"
            name="opcion"
          />
        </SisdaiBotonesRadioGrupo>
      </div>
      <div v-if="props.pregunta.obligatorio">Obligatoria*</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-opcion {
  flex: 1;
}

.boton-eliminar-opcion {
  align-self: flex-end;
}
</style>
