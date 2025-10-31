<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  layout: 'levantamiento',
  middleware: 'auth',
});

/* const storeLevantamiento = useLevantamientoStore(); */

const imagenProyecto = ref(null);
const imagenPreview = ref(null);

async function guardarArchivo(archivo) {
  imagenProyecto.value = archivo;
}
</script>

<template>
  <div class="columna-8">
    <form action="">
      <ClientOnly>
        <SisdaiCampoBase
          etiqueta="Nombre del proyecto"
          ejemplo="Escribe el nombre de tu proyecto"
          :es_etiqueta_visible="true"
          :es_obligatorio="false"
          class="m-b-2"
        />
        <SisdaiSelector etiqueta="Institución a la que pertenece" class="m-b-2">
          <option value="1">Opcion Uno</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
        <SisdaiSelector etiqueta="Categoría del proyecto" class="m-b-2">
          <option value="1">Opcion Uno</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
        <SisdaiAreaTexto
          etiqueta="Objetivo del proyecto"
          ejemplo="Describe brevemente tu proyecto"
          :es_etiqueta_visible="true"
          :es_obligatorio="false"
          class="m-b-2"
        />
        <SisdaiAreaTexto
          etiqueta="Instrucciones para participantes"
          ejemplo="Describe brevemente tu proyecto"
          :es_etiqueta_visible="true"
          :es_obligatorio="false"
          class="m-b-2"
        />
        <label>Imagen de identificación del proyecto</label>
        <IaElementoDragNdDrop
          ref="dragNdDrop"
          :imagen-inicial="imagenPreview"
          @pasar-archivo="(i) => guardarArchivo(i)"
        />
      </ClientOnly>
    </form>
  </div>
</template>
