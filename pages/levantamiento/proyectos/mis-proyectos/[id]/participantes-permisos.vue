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
    description:
      'Cualquier persona puede encontrar el proyecto o cualquier persona con el enlace puede participar',
  },
  {
    name: 'privacidad',
    value: 'privado',
    label: 'Proyecto privado',
    description: 'Solo personas invitadas pueden participar',
  },
];

const privacidadSeleccionada = ref('publico');

const permisos = [
  {
    value: 'administrar',
    label: 'Administrar',
    description: 'Control total del proyecto, gestión de usuarios y configuración',
  },
  {
    value: 'revisar',
    label: 'Revisar',
    description: 'Puede revisar, comentar y aprobar cambios en el proyecto',
  },
  {
    value: 'participar',
    label: 'Participar',
    description: 'Puede contribuir activamente con aportes de información',
  },
  {
    value: 'ver',
    label: 'Solo ver',
    description: 'Solo puede visualizar el contenido sin realizar cambios',
  },
];

const usuariosAsignados = [
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Revisar', fecha: '17/10/2025' },
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Administrar', fecha: '17/10/2025' },
];
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
      <div
        class="privacidad-mensaje p-x-3 p-y-2 borde borde-color-alerta borde-redondeado-20 m-b-3 fondo-color-alerta texto-color-alerta"
      >
        <div class="flex mensaje-contenido">
          <div class="mensaje-titulo m-b-1">
            <span class="pictograma-alerta" />
            <b class="m-l-1">Los proyectos públicos requieren aprobación</b>
          </div>
          <div class="texto-tamanio-2">
            Al hacer público un proyecto será visible para todas las personas, con el fin de
            asegurar el correcto funcionamiento del proyecto y la calidad de los aportes, un
            proyecto configurado como “público” debe ser aprobado por un administrador
          </div>
        </div>
      </div>
      <div class="flex flex-contenido-final">
        <button class="boton-primario boton-chico" aria-label="Guardar Cambios">
          Solicitar aprobación
        </button>
      </div>
    </div>

    <div>
      <h6>Invita por correo electrónico</h6>
      <p>Asigna los niveles de acceso y edición de cada persona usuaria en el proyecto.</p>
      <div class="grid m-b-3">
        <template v-for="permiso in permisos" :key="permiso.value">
          <div class="columna-4 permiso-container p-2 borde-redondeado-8 fondo-color-neutro">
            <span class="m-b-minimo texto-tamanio-3">{{ permiso.label }}</span>
            <span class="texto-tamanio-2">{{ permiso.description }}</span>
          </div>
        </template>
      </div>
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
        <div class="flex flex-contenido-final">
          <button class="boton-primario boton boton-chico">Enviar invitación</button>
        </div>
      </form>
      <div>
        <h6>Permisos asignados</h6>
        <div class="flex usuarios-asignados">
          <div
            v-for="usuario in usuariosAsignados"
            :key="usuario.email"
            class="correo-participante borde-redondeado-8 fondo-color-acento p-2 flex flex-contenido-separado"
          >
            <div>
              <div class="m-b-minimo texto-tamanio-3 asignado-email">{{ usuario.email }}</div>
              <div class="flex">
                <span
                  class="p-x-1 p-y-minimo borde borde-color-acento borde-redondeado-8 texto-color-secundario"
                  >{{ usuario.permiso }}</span
                >
                <span class="asignado-fecha texto-tamanio-2">Asignado el {{ usuario.fecha }}</span>
              </div>
            </div>
            <div class="flex">
              <button class="boton-secundario boton boton-chico">Cambiar permiso</button>
              <button class="boton-secundario boton boton-chico">Eliminar</button>
            </div>
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
  gap: 0;

  .mensaje-contenido {
    gap: 0;
  }
}

.permiso-container {
  display: flex;
  flex-direction: column;

  .texto-tamanio-3 {
    font-weight: 500;
  }

  .texto-tamanio-2 {
    font-weight: 400;
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

.usuarios-asignados {
  flex-direction: column;

  button {
    align-self: center;
  }
}

.asignado-email {
  font-weight: 500;
}

.asignado-fecha {
  align-self: flex-end;
}
</style>
