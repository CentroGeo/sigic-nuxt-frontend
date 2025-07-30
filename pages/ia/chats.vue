<script setup lang="ts">
const storeIA = useIAStore();

const archivo = ref<File | null>(null);
const titulo = ref("Documento de prueba");

async function subirArchivo() {
  const formData = new FormData();
  formData.append("title", titulo.value);
  formData.append("file", archivo.value!);

  const res = await fetch(
    "http://localhost:8001/api/fileuploads/upload-to-geonode/",
    {
      method: "POST",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUZ1MxMG9adEhzcU12NDIwWG51ZGVXdFpsZ3pMSmRvUUNGRmpNSW5FdllJIn0.eyJleHAiOjE3NTM4NTk2NDEsImlhdCI6MTc1MzgyMzY0MSwianRpIjoib25ydHJvOjdiYjVhMDYzLTU1YmItNDRmNC05ZmQ0LWEzNGIyYzc4ZTc4NSIsImlzcyI6Imh0dHBzOi8vaWFtLmRldi5nZW9pbnQubXgvcmVhbG1zL3NpZ2ljIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjQ3MDUwNzRkLTI5MGItNDYzMC1hMDk5LTQyMzdhMGQ0MDExZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImlhbS1wdWJsaWNyb3BjLWRldiIsInNpZCI6IjBiNjU1NzdkLWRjZGMtNDU0Ni05YWQ1LWQ1MjQwODk2NTIxZSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLXNpZ2ljIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJGZXJuYW5kbyBWYWxsZSIsInByZWZlcnJlZF91c2VybmFtZSI6ImZlcnZhbGxlIiwiZ2l2ZW5fbmFtZSI6IkZlcm5hbmRvIiwibG9jYWxlIjoiZXMiLCJmYW1pbHlfbmFtZSI6IlZhbGxlIiwiZW1haWwiOiJwc3AuZnZhbGxlQGNlbnRyb2dlby5lZHUubXgifQ.CeRdnhwQeBFkrf0B0iuTzh0zPvR2pICaTSkjesxAqcFN0DqLQVLF4YQ6Vkge_Eyf5eEUa34jns482j7A7Ky3Ci8-vLsTr_F7azqmdJVxFD8TBZLiZRBZFrmDHKoGk4HYh1ZD1wHcVJjT3fR2Jd0iyMEFkRc90HQ3RH1mqjFHqNQ9BwIDbG8doG54Atz8n57GDT9luU6K3x-DOYb8j-WkwxdMsYUztPJs0MX8T9ro5wOT-QPOvQNRqC5mgcP7tW0htr_u3r5AkyxT13C48JCL-T9LJpE06Hhk6nq8AwiqK6FuXjLpSEHOFKNQPh1Q2Cf_TTc5dFYR4HpqOW5OpqDPXw",
      },
      credentials: "include",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(`Upload falló: ${res.status}`);
  }

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
        <button @click="subirArchivo">Subir</button>
      </div>
      <IaLeyendaInicioVistas v-if="!storeIA.existenProyectos" />

      <div v-else>Da click en un chat para iniciar o crea un nuevo chat</div>
    </template>
  </IaLayoutPaneles>
</template>
