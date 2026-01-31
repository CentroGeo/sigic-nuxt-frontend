<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { useRoute, useRouter } from 'vue-router';

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

const { data } = useAuth();
const route = useRoute();

const participante = reactive({
  email: '',
  rol: '',
});

const proyecto = ref(null);

watch(
  () => data.value?.user.email,
  async (email) => {
    if (!email) return;

    proyecto.value = await storeLevantamiento.obtenerProyectoPorId(email, route.params.id);
  },
  { immediate: true }
);

const privacidadSeleccionada = ref('privado');

watch(
  () => proyecto.value?.es_privada,
  (esPrivada) => {
    if (esPrivada === true) {
      privacidadSeleccionada.value = 'privado';
    } else if (esPrivada === false) {
      privacidadSeleccionada.value = 'publico';
    }
  },
  { immediate: true }
);

onMounted(() => {
  storeLevantamiento.obtenerParticipantesPorProyecto(data.value?.user.email, route.params.id);
});

const agregarParticipante = async () => {
  await storeLevantamiento.agregarParticipanteProyecto(
    data.value?.user.email,
    participante.email,
    participante.rol,
    route.params.id
  );

  await storeLevantamiento.obtenerParticipantesPorProyecto(data.value?.user.email, route.params.id);
};

const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return fecha;
};

const modalCambiarPermiso = ref(null);
const participanteSeleccionado = ref(null);
const permisoSeleccionado = ref('');

const abrirModalCambiarPermiso = (participante) => {
  participanteSeleccionado.value = participante;
  permisoSeleccionado.value = participante.rol;
  modalCambiarPermiso.value.abrirModal();
};

const actualizarPermiso = async () => {
  await storeLevantamiento.actualizarParticipanteProyecto(
    data.value?.user.email,
    permisoSeleccionado.value,
    route.params.id,
    participanteSeleccionado.value.id
  );

  await storeLevantamiento.obtenerParticipantesPorProyecto(data.value?.user.email, route.params.id);
  modalCambiarPermiso.value.cerrarModal();
};

const modalEliminarPermiso = ref(null);

const abrirModalEliminarPermiso = (participante) => {
  participanteSeleccionado.value = participante;
  modalEliminarPermiso.value.abrirModal();
};
const eliminarPermiso = async () => {
  await storeLevantamiento.eliminarParticipanteProyecto(
    data.value?.user.email,
    route.params.id,
    participanteSeleccionado.value.id
  );

  await storeLevantamiento.obtenerParticipantesPorProyecto(data.value?.user.email, route.params.id);
  modalEliminarPermiso.value.cerrarModal();
};

const modalSolicitarAprobacion = ref(null);

const solicitarAprobacion = async () => {
  const payload = {
    isPrivate: false,
  };

  await storeLevantamiento.actualizarFormularioParticipantesProyecto(payload, route.params.id);

  modalSolicitarAprobacion.value.abrirModal();
};

const router = useRouter();

const irAMisProyectos = () => {
  router.push('/levantamiento/proyectos/mis-proyectos');
};

const modalProyectoPrivado = ref(null);

const actualizarProyecto = async () => {
  const payload = {
    isPrivate: true,
  };

  await storeLevantamiento.actualizarFormularioParticipantesProyecto(payload, route.params.id);

  modalProyectoPrivado.value.abrirModal();
};

defineExpose({
  actualizarProyecto,
});
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
        aria-label="Agregar participantes"
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
        <button
          class="boton-primario boton-chico"
          aria-label="Solicitar aprobación"
          @click="solicitarAprobacion"
        >
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
      <div class="m-b-3">
        <ClientOnly>
          <div class="flex privacidad-acciones m-b-3">
            <div class="privacidad-input">
              <SisdaiCampoBase
                v-model="participante.email"
                etiqueta="Correo electrónico del participante"
                ejemplo="Ingresa un correo electrónico"
                :es_etiqueta_visible="true"
              />
            </div>
            <div class="privacidad-input">
              <SisdaiSelector v-model="participante.rol" etiqueta="Permiso">
                <option value="Administrar">Administrar</option>
                <option value="Revisar">Revisar</option>
                <option value="Participar">Participar</option>
                <option value="Solo ver">Solo ver</option>
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
          <button class="boton-primario boton boton-chico" @click="agregarParticipante">
            Enviar invitación
          </button>
        </div>
      </div>
      <div>
        <h6>Permisos asignados</h6>
        <div class="flex usuarios-asignados">
          <div
            v-for="participante in storeLevantamiento.participantes"
            :key="participante.id"
            class="correo-participante borde-redondeado-8 fondo-color-acento p-2 flex flex-contenido-separado"
          >
            <div>
              <div class="m-b-minimo texto-tamanio-3 asignado-email">{{ participante.correo }}</div>
              <div class="flex">
                <span
                  class="p-x-1 p-y-minimo borde borde-color-acento borde-redondeado-8 texto-color-secundario"
                  >{{ participante.rol }}</span
                >
                <span class="asignado-fecha texto-tamanio-2"
                  >Asignado el {{ formatearFecha(participante.created_date) }}</span
                >
              </div>
            </div>
            <div class="flex">
              <button
                class="boton-secundario boton boton-chico"
                @click="abrirModalCambiarPermiso(participante)"
              >
                Cambiar permiso
              </button>
              <button
                class="boton-secundario boton boton-chico"
                @click="abrirModalEliminarPermiso(participante)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ClientOnly>
      <SisdaiModal ref="modalCambiarPermiso">
        <template #encabezado><h3>Cambiar permiso</h3></template>
        <template #cuerpo>
          <p class="m-t-0 m-b-3">
            Selecciona los permisos que deseas asignarle a esta persona usuaria
          </p>
          <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
            <SisdaiBotonRadio
              v-model="permisoSeleccionado"
              etiqueta="Administrar"
              value="Administrar"
              name="permiso-usuario"
            />
            <SisdaiBotonRadio
              v-model="permisoSeleccionado"
              etiqueta="Revisar"
              value="Revisar"
              name="permiso-usuario"
            />
            <SisdaiBotonRadio
              v-model="permisoSeleccionado"
              etiqueta="Participar"
              value="Participar"
              name="permiso-usuario"
            />
            <SisdaiBotonRadio
              v-model="permisoSeleccionado"
              etiqueta="Solo ver"
              value="Solo ver"
              name="permiso-usuario"
            />
          </SisdaiBotonesRadioGrupo>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="modalCambiarPermiso?.cerrarModal()"
          >
            Cerrar
          </button>
          <button type="button" class="boton-primario boton-chico" @click="actualizarPermiso">
            Asignar permiso
          </button>
        </template>
      </SisdaiModal>

      <SisdaiModal ref="modalEliminarPermiso">
        <template #encabezado><h3>Eliminar permiso</h3></template>
        <template #cuerpo>
          <p class="m-t-0 m-b-3">
            ¿Deseas eliminar los permisos de esta persona usuaria? después de realizar esta acción
            ya no podrá participar en tu proyecto hasta que sea invitada nuevamente.
          </p>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="modalEliminarPermiso?.cerrarModal()"
          >
            Regresar
          </button>
          <button type="button" class="boton-primario boton-chico" @click="eliminarPermiso">
            Confirmar
          </button>
        </template>
      </SisdaiModal>

      <SisdaiModal ref="modalSolicitarAprobacion">
        <template #encabezado><h3>Proyecto enviado a aprobación</h3></template>
        <template #cuerpo>
          <p class="m-t-0 m-b-3">
            Tu proyecto se ha enviado a aprobación para hacerlo público, te enviaremos un correo
            electrónico cuando se haya revisado.
          </p>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="modalSolicitarAprobacion?.cerrarModal()"
          >
            Cerrar
          </button>
          <button type="button" class="boton-primario boton-chico" @click="irAMisProyectos">
            Ir a Mis proyectos
          </button>
        </template>
      </SisdaiModal>

      <SisdaiModal ref="modalProyectoPrivado">
        <template #encabezado><h3>Proyecto privado</h3></template>
        <template #cuerpo>
          <p class="m-t-0 m-b-3">Tu proyecto se ha cambiado a privado.</p>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="modalProyectoPrivado?.cerrarModal()"
          >
            Cerrar
          </button>
          <button type="button" class="boton-primario boton-chico" @click="irAMisProyectos">
            Ir a Mis proyectos
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
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
