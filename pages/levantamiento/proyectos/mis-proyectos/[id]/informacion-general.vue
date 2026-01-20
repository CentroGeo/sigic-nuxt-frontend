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

const { data } = useAuth();

const proyecto = ref({
  nombre: '',
  institucion: '',
  descripcion: '',
  objetivo: '',
  instrucciones: '',
  imagen: null,
});

watch(
  () => data.value?.user.email,
  async (email) => {
    if (!email) return;

    proyecto.value = await storeLevantamiento.obtenerProyectoPorId(email, route.params.id);
  },
  { immediate: true }
);

watch(
  proyecto,
  (nuevoProyecto) => {
    if (!nuevoProyecto?.imagen) return;

    const imageUrl = `${config.public.levantamientoBackendUrl}/${nuevoProyecto.imagen}`;
    imagenPreview.value = imageUrl;
  },
  { immediate: true }
);

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
  formData.append('instrucciones', proyecto.value.instrucciones);

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
