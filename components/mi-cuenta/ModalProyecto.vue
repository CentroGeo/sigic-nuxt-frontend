<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { wait } from '~/utils/consulta';

const props = defineProps({
  proyecto: {
    type: Object,
    default: () => {},
  },
  tipo: {
    type: String,
    default: '',
  },
});

const guardando = ref(false);
const modalProyecto = ref(null);
const action = Object.keys(props.proyecto).length === 0 ? 'Agregar' : 'Editar';
const titulo = ref(action === 'Agregar' ? '' : props.proyecto.titulo);
const rol = ref(action === 'Agregar' ? '' : props.proyecto.rol);
const periodo = ref(action === 'Agregar' ? '' : props.proyecto.anio_periodo);
const enlace = ref(action === 'Agregar' ? '' : props.proyecto.enlace);
const emit = defineEmits(['ProyectoGuardado']);

function abrirModalProyecto() {
  modalProyecto.value?.abrirModal();
}

defineExpose({
  abrirModalProyecto,
});

async function guardar() {
  guardando.value = true;
  await wait(2000);
  emit('ProyectoGuardado');
  modalProyecto.value?.cerrarModal();
  guardando.value = false;
}

function cancelar() {
  modalProyecto.value?.cerrarModal();
}
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalProyecto">
      <template #encabezado>
        <h1>{{ action }} {{ props.tipo }}</h1>
      </template>

      <template #cuerpo>
        <ClientOnly v-if="!guardando">
          <SisdaiCampoBase
            :id="`input-${titulo}`"
            v-model="titulo"
            etiqueta="Proyecto"
            tipo="text"
            class="m-y-1"
            :ejemplo="titulo"
          />
          <SisdaiCampoBase
            :id="`input-${rol}`"
            v-model="rol"
            etiqueta="Rol o tipo de participación"
            tipo="text"
            class="m-y-1"
            :ejemplo="rol"
          />
          <SisdaiCampoBase
            :id="`input-${periodo}`"
            v-model="periodo"
            etiqueta="Año o Periodo"
            tipo="text"
            class="m-y-1"
            :ejemplo="periodo"
          />
          <SisdaiCampoBase
            :id="`input-${enlace}`"
            v-model="enlace"
            etiqueta="Enlace"
            tipo="text"
            class="m-y-1"
            :ejemplo="enlace"
          />
        </ClientOnly>
        <div v-else class="columna-4 flex-vertical-centrado">
          <img src="/img/loader.gif" alt="...Cargando" />
        </div>
      </template>
      <template v-if="!guardando" #pie>
        <button type="button" class="boton-chico boton-primario ancho" @click="guardar">
          Guardar
        </button>
        <button
          type="button"
          class="boton-chico boton-con-contenedor-secundario ancho"
          @click="cancelar"
        >
          Cancelar
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
img {
  object-fit: contain;
  height: 80px;
}
.ancho {
  width: 50%;
  display: flex;
  justify-content: center; /* horizontal center */
}

.contenedor {
  margin: 0px;
  padding: 8px;
  align-items: center;
}

.tarjeta {
  background-color: var(--color-neutro-0);
  border: 1px solid var(--color-secundario-8);
}

.contenedor-liga-ows {
  border: 1px solid var(--color-secundario-8);
  padding: 0px 8px;
}
.contenedor-alerta {
  position: absolute;
  top: -40px;
  background-color: var(--color-neutro-4);
  color: var(--color-neutro-1);
  padding: 0px 8px;
  width: max-content;
}
.ows-container {
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
