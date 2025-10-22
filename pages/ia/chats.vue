<script setup>
const storeIA = useIAStore();

const isLoading = ref(true);

const loadProjects = async () => {
  await storeIA.getProjectsList();
  isLoading.value = false;
};

onMounted(() => {
  loadProjects();
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <template v-if="!isLoading">
        <IaLeyendaInicioListas v-if="!storeIA.existenProyectos" />

        <IaListaChats
          v-else
          titulo="Chats"
          texto-boton="Nuevo chat"
          etiqueta-busqueda="Buscar chats"
        />
      </template>
    </template>

    <template #visualizador>
      <main
        id="principal"
        class="contenedor m-b-10 p-t-3"
        :style="storeIA.existenProyectos ? 'height: var(--altura-consulta-esc);' : ''"
      >
        <IaLeyendaInicioVistas v-if="!isLoading && !storeIA.existenProyectos" />
        <!-- <p v-else-if="!isLoading && storeIA.existenProyectos">Selecciona un chat</p> -->
      </main>
    </template>
  </UiLayoutPaneles>
</template>
