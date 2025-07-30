<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth',
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
</script>
<template>
  <main>
    <h2>Esto es la vista de carga</h2>
    <section id="">
      <div class="contenedor">
        <h3>Sección</h3>
        <input type="file" @change="(e) => (archivo = e.target.files[0])" >
        <input v-model="titulo" placeholder="Título" >
        <input v-model="descripcion" placeholder="Descripción" >
        <button @click="subirArchivo">Subir</button>
      </div>
    </section>
  </main>
</template>
