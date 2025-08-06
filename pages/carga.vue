<script setup lang="ts">
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const archivo = ref<File | null>(null);
const titulo = ref('');
const descripcion = ref('');
const { data, status } = useAuth();
watchEffect(() => {
  if (status.value === 'authenticated') {
    // pass
  }
});
async function subirArchivo() {
  if (descripcion.value !== '') {
    const token = data.value?.accessToken;
    const formData = new FormData();
    formData.append('title', titulo.value);
    formData.append('abstract', descripcion.value);
    formData.append('base_file', archivo.value!);
    formData.append('token', token);

    await fetch('/api/subir', {
      method: 'POST',
      body: formData,
    });

    // // const json = await res.json();
  }
}
</script>
<template>
  <main>
    <h2>Esto es la vista de carga</h2>
    <section id="">
      <div class="contenedor">
        <h3>Sección</h3>
        <input type="file" @change="(e) => (archivo = e.target.files[0])" />
        <input v-model="titulo" placeholder="Título" />
        <!-- <input v-model="descripcion" placeholder="Descripción" /> -->
        <ClientOnly>
          <SisdaiCampoBase
            v-model="descripcion"
            etiqueta="Descripción"
            ejemplo="Descripción"
            tipo="text"
            texto_ayuda="Texto de ayuda."
            :es_obligatorio="true"
            :es_etiqueta_visible="true"
          />
        </ClientOnly>
        <button @click="subirArchivo()">Subir</button>
      </div>
    </section>
  </main>
</template>
