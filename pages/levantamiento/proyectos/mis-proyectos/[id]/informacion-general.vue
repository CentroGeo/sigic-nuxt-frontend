<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  layout: 'levantamiento',
  middleware: 'auth',
});

const config = useRuntimeConfig();

const route = useRoute();
const router = useRouter();
const storeLevantamiento = useLevantamientoStore();

const imagenProyecto = ref(null);
const imagenPreview = ref(null);

async function guardarArchivo(archivo) {
  imagenProyecto.value = archivo;
}

const proyecto = computed(() => storeLevantamiento.obtenerProyectoPorId(route.params.id));
/* const proyecto = {
  nombre: 'Mapa de puntos de basura acumulada',
  institucion: 'CentroGeo',
  categoria: 'Infraestructura y servicios',
  objetivo:
    'Crear un inventario detallado de puntos de basura acumulada en espacios públicos, documentando su ubicación, estado y el impacto ambiental, con el objetivo de promover la participación ciudadana en la limpieza y conservación del entorno.',
  instrucciones:
    '1.Completa el formulario de recolección de datos sobre puntos de basura acumulada.\n2.Proporciona información precisa sobre la ubicación de la basura.\n3.Indica la cantidad de basura presente.\n4.Tu colaboración ayudará a las autoridades a limpiar y mantener el área de manera efectiva.',
}; */

function cargarImagenDelContexto() {
  if (!proyecto.value?.imagen) {
    console.error('No se encontró imagen en el proyecto');
    return;
  }

  const imageUrl = `${config.public.levantamientoBackendUrl}/${proyecto.value.imagen}`;
  imagenPreview.value = imageUrl;
}

onMounted(async () => {
  cargarImagenDelContexto();
});

onBeforeUnmount(() => {
  if (imagenPreview.value) {
    URL.revokeObjectURL(imagenPreview.value);
  }
});

async function actualizarProyecto() {
  const formData = new FormData();

  formData.append('nombre', proyecto.value.nombre);
  formData.append('institucion', proyecto.value.institucion);
  formData.append('categoria', proyecto.value.descripcion);
  formData.append('objetivo', proyecto.value.objetivo);
  formData.append('instrucciones', proyecto.value.especificaciones_multimedia);

  if (imagenProyecto.value) {
    const timestamp = Date.now();
    const extension = imagenProyecto.value.name.split('.').pop();
    const baseName = imagenProyecto.value.name.replace(`.${extension}`, '');

    const nombreImagen = `${baseName}_${timestamp}.${extension}`;

    formData.append('image', imagenProyecto.value, nombreImagen);
  }

  await storeLevantamiento.actualizarProyecto(formData, route.params.id);
  router.push('/levantamiento/proyectos/mis-proyectos');
}

defineExpose({
  actualizarProyecto,
});
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
          <option value="inst_1">Institución Uno</option>
          <option value="inst_2">Institución Dos</option>
          <option value="inst_3">Institución Tres</option>
        </SisdaiSelector>
        <SisdaiSelector
          v-model="proyecto.descripcion"
          etiqueta="Categoría del proyecto"
          class="m-b-2"
        >
          <option value="cat_1">Categoría Uno</option>
          <option value="cat_2">Categoría Dos</option>
          <option value="cat_3">Categoría Tres</option>
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
          v-model="proyecto.especificaciones_multimedia"
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
