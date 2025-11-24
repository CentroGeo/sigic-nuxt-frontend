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

const proyecto = {
  nombre: 'Mapa de puntos de basura acumulada',
  institucion: 'CentroGeo',
  categoria: 'Infraestructura y servicios',
  objetivo:
    'Crear un inventario detallado de puntos de basura acumulada en espacios públicos, documentando su ubicación, estado y el impacto ambiental, con el objetivo de promover la participación ciudadana en la limpieza y conservación del entorno.',
  instrucciones:
    '1.Completa el formulario de recolección de datos sobre puntos de basura acumulada.\n2.Proporciona información precisa sobre la ubicación de la basura.\n3.Indica la cantidad de basura presente.\n4.Tu colaboración ayudará a las autoridades a limpiar y mantener el área de manera efectiva.',
};
</script>

<template>
  <div class="columna-8">
    <form action="">
      <ClientOnly>
        <SisdaiCampoBase
          v-model="proyecto.nombre"
          etiqueta="Nombre del proyecto"
          ejemplo="Escribe el nombre de tu proyecto"
          :es_etiqueta_visible="true"
          :es_obligatorio="false"
          class="m-b-2"
        />
        <SisdaiSelector
          v-model="proyecto.institucion"
          etiqueta="Institución a la que pertenece"
          class="m-b-2"
        >
          <option value="CentroGeo">CentroGeo</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
        <SisdaiSelector
          v-model="proyecto.categoria"
          etiqueta="Categoría del proyecto"
          class="m-b-2"
        >
          <option value="Infraestructura y servicios">Infraestructura y servicios</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
        <SisdaiAreaTexto
          v-model="proyecto.objetivo"
          etiqueta="Objetivo del proyecto"
          ejemplo="Describe brevemente tu proyecto"
          :es_etiqueta_visible="true"
          :es_obligatorio="false"
          class="m-b-2"
        />
        <SisdaiAreaTexto
          v-model="proyecto.instrucciones"
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
