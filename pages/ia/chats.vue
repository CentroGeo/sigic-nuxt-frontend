<script setup lang="ts">
const storeIA = useIAStore();

const archivo = ref<File | null>(null);
const titulo = ref("Documento de prueba");

const { data, status } = useAuth();

async function subirArchivo() {
  const token = data.value?.accessToken;
  console.log("token", token);

  const formData = new FormData();
  formData.append("title", titulo.value);
  // solo recibe archivos de texto pdf, ...
  formData.append("file", archivo.value!);
  formData.append("token", token);
  console.log(formData);

  const res = await fetch("/api/subirIA", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
}
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLeyendaInicioListas />

      <IaListaChats
        v-if="storeIA.existenProyectos"
        texto-boton="Nuevo chat"
        titulo="Chats"
        etiqueta-busqueda="Buscar chats"
      />
    </template>

    <template #vistas-ia>
      <div>
        <input type="file" @change="(e) => (archivo = e.target.files[0])" />
        <input v-model="titulo" placeholder="Título" />
        <button @click="subirArchivo()">Subir</button>
      </div>
      <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />

      <div v-else>Da click en un chat para iniciar o crea un nuevo chat</div>
    </template>
  </IaLayoutPaneles>
</template>
