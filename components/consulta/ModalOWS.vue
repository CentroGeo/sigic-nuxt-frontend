<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { wait } from '~/utils/consulta';

const props = defineProps({
  owsLink: {
    type: String,
    default: '',
  },
  service: {
    type: String,
    default: '',
  },
});
const linkStatus = ref(false);
const modalOWS = ref(null);
function abrirModalOWS() {
  linkStatus.value = false;
  modalOWS.value?.abrirModal();
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.owsLink);
    //alert('Enlace copiado al portapapeles: ' + props.owsLink);
    linkStatus.value = true;
    await wait(1000);
    linkStatus.value = false;
  } catch (err) {
    console.error('Error al copiar: ', err);
  }
}

defineExpose({
  abrirModalOWS,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalOWS">
      <template #encabezado>
        <h1>Compartir acceso {{ props.service }}</h1>
      </template>

      <template #cuerpo>
        <p>
          <span v-if="props.service === 'OWS'">Código Open Web Services (OWS).</span>
          <span v-if="props.service === 'CSW'">Código Catalogue Service for the Web (CSW).</span>
          Usalo para conectar el banco de datos de SIGIC en otros visores o servicios compatibles.
        </p>
        <div class="flex borde-redondeado-8 contenedor-liga-ows">
          <p class="columna-14 m-y-1">
            {{ props.owsLink }}
          </p>
          <button
            aria-label="Copiar liga OWS"
            class="boton-primario boton-pictograma boton-chico m-y-1"
            style="align-self: start"
            type="button"
            @click="copyLink"
          >
            <span aria-hidden="true" class="pictograma-copiar" />
          </button>
        </div>

        <div class="flex flex-contenido-centrado m-t-2">
          <button
            class="columna-8 boton-secundario boton-chico flex flex-contenido-centrado"
            type="button"
            @click="modalOWS.cerrarModal"
          >
            Cerrar
          </button>
          <button
            class="columna-8 boton-primario boton-chico flex flex-contenido-centrado"
            type="button"
            @click="copyLink"
          >
            Copiar código
          </button>
          <div v-if="linkStatus" class="m-y-1 m-x-2 borde-redondeado-8 contenedor-alerta">
            <span class="pictograma-aprobado"></span> Enlace copiado con éxito
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
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
</style>
