<script setup>
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";
import SisdaiGrupoBotonesRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue";
import SisdaiBotonRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import { ref } from "vue";

const showModal = ref(false);
const sisdaiModal = ref(null);

const salida = ref();

definePageMeta({
  layout: "panel",
});
</script>

<template>
  <main>
    <div>
      <button
        type="button"
        class="boton-primario"
        @click="sisdaiModal?.abrirModal()"
      >
        Crear nuevo proyecto
        <span class="pictograma-agregar" aria-hidden="true" />
      </button>
    </div>

    <SisdaiModal ref="sisdaiModal">
      <template #encabezado>
        <h1>Crear nuevo proyecto</h1>
      </template>

      <template #cuerpo>
        <form action="">
          <SisdaiCampoBase
            etiqueta="Nombre del proyecto"
            ejemplo=""
            :es_etiqueta_visible="true"
          />

          <SisdaiAreaTexto etiqueta="Descripción" />

          <SisdaiGrupoBotonesRadio leyenda="Visibilidad">
            <SisdaiBotonRadio
              etiqueta="Público"
              value="publico"
              name="visibilidad"
            />
            <SisdaiBotonRadio
              etiqueta="Privado"
              value="privado"
              name="visibilidad"
            />
          </SisdaiGrupoBotonesRadio>
        </form>
      </template>

      <template #pie>
        <button
          type="button"
          class="boton-secundario boton-chico"
          @click="sisdaiModal.cerrarModal()"
        >
          Cancelar
        </button>
        <button type="button" class="boton-primario boton-chico">
          Crear proyecto
        </button>
      </template>
    </SisdaiModal>
  </main>
</template>
