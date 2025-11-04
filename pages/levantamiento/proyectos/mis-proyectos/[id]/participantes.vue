<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const storeLevantamiento = useLevantamientoStore();

const elementosPrivacidad = [
  {
    name: 'privacidad',
    value: 'publico',
    label: 'Proyecto público',
    description: 'Cualquier persona con el enlace puede participar',
  },
  {
    name: 'privacidad',
    value: 'privado',
    label: 'Proyecto privado',
    description: 'Solo personas invitadas pueden participar',
  },
];

const privacidadSeleccionada = ref('publico');

const enlaceProyecto = ref('https://sigic.secihti.gob.mx/proyecto/34759');

const participantesAgregados = ref([
  'crovelo@centrogeo.edu.mx',
  'osanchez@centrogeo.edu.mx',
  'msosa@centrogeo.edu.mx',
]);
</script>

<template>
  <div
    v-if="!storeLevantamiento.existenParticipantes"
    class="columna-8 texto-centrado fondo-color-acento p-2 borde-redondeado-8 contenido-participantes"
  >
    <span class="pictograma-grupo pictograma-grande texto-color-acento"></span>
    <h6 class="m-t-0 m-b-1 texto-color-secundario">Invita participantes</h6>
    <p class="m-t-0 m-b-1">
      Define si tu proyecto es publico o privado e invita a otras personas a participar con aportes.
    </p>
    <div class="texto-centrado">
      <button
        class="boton-primario boton boton-chico"
        aria-label="Crear nuevo proyecto"
        @click="storeLevantamiento.alternarParticipantes"
      >
        Agregar participantes
      </button>
    </div>
  </div>

  <div v-else class="columna-10">
    <h6 class="m-b-3">Selecciona la privacidad de tu proyecto</h6>
    <div class="flex m-b-3">
      <template v-for="elemento in elementosPrivacidad" :key="elemento.value">
        <levantamiento-radio-boton
          v-model="privacidadSeleccionada"
          :name="elemento.name"
          :value="elemento.value"
          :label="elemento.label"
          :description="elemento.description"
        />
      </template>
    </div>
    <div v-if="privacidadSeleccionada === 'publico'">
      <div class="privacidad-mensaje p-x-3 p-y-2 borde-redondeado-20 m-b-3">
        <div class="flex mensaje-contenido">
          <div class="mensaje-titulo m-b-1">
            <span class="pictograma-aprobado" />
            <b class="m-l-1">Proyecto abierto </b>
          </div>
          <div>
            Este proyecto es público. Cualquier persona lo puede encontrar en la sección “Proyectos
            públicos” o acceder a él mediante el enlace de invitación.
          </div>
        </div>
      </div>
      <div class="m-b-3 flex privacidad-acciones">
        <div class="privacidad-input">
          <label class="m-b-1" for="enlaceProyecto">Enlace del proyecto</label>
          <input
            id="enlaceProyecto"
            v-model="enlaceProyecto"
            type="text"
            name="enlaceProyecto"
            disabled
          />
        </div>
        <button class="boton-primario boton boton-chico">Copiar</button>
      </div>
      <div class="flex privacidad-acciones">
        <div class="privacidad-input">
          <SisdaiCampoBase
            v-model="nombreProyecto"
            etiqueta="Enviar enlace por correo"
            ejemplo="Ingresa un correo electrónico"
            :es_etiqueta_visible="true"
          />
        </div>
        <button class="boton-primario boton boton-chico">Enviar</button>
      </div>
    </div>

    <div v-else>
      <h6>Invita por correo electrónico</h6>
      <form class="m-b-3">
        <ClientOnly>
          <div class="flex privacidad-acciones m-b-3">
            <div class="privacidad-input">
              <SisdaiCampoBase
                etiqueta="Correo electrónico del participante"
                ejemplo="Ingresa un correo electrónico"
                :es_etiqueta_visible="true"
              />
            </div>
            <div class="privacidad-input">
              <SisdaiSelector etiqueta="Permiso">
                <option value="1">Administrar</option>
                <option value="2">Revisar</option>
                <option value="3">Participar</option>
                <option value="4">Solo ver</option>
              </SisdaiSelector>
            </div>
          </div>
          <SisdaiAreaTexto
            etiqueta="Mensaje personalizado"
            ejemplo="Escribe un mensaje para la persona invitada"
            :es_etiqueta_visible="true"
            :es_obligatorio="false"
            class="m-b-3"
          />
        </ClientOnly>
        <button class="boton-primario boton boton-chico">Enviar invitación</button>
      </form>
      <div>
        <h6>Participantes agregados</h6>
        <div class="flex participantes-agregados">
          <div
            v-for="participante in participantesAgregados"
            :key="participante"
            class="correo-participante borde-redondeado-8 fondo-color-acento borde borde-color-acento p-x-1 p-y-minimo"
          >
            {{ participante }}
            <button
              class="boton-pictograma boton-sin-contenedor-primario"
              aria-label="Acción a realizar"
              type="button"
            >
              <span class="pictograma-cerrar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenido-participantes {
  align-self: center;
}

.privacidad-mensaje {
  border: 1px solid #19439c;
  background: #ecf2ff;
  gap: 0;
  color: #19439c;

  .mensaje-contenido {
    gap: 0;
  }
}

.privacidad-acciones {
  .privacidad-input {
    flex: 1;
  }

  button {
    align-self: flex-end;
  }
}

.participantes-agregados {
  flex-direction: column;

  .correo-participante {
    width: fit-content;
    display: flex;
    align-items: center;
  }
}
</style>
