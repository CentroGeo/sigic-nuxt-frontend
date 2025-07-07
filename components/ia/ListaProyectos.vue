<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";
import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
const proyectos = ref([
  {
    id: 0,
    titulo: "Biodiversidad de ecosistemas marinos",
    numero_contextos: 0,
    numero_fuentes: 9,
  },
]);
const listaProyectosFiltrada = ref(proyectos.value);
</script>
<template>
  <div>
    <div class="p-x-3 p-t-3">
      <button
        class="boton-primario boton-pictorgrama flex-contenido-centrado boton-nuevo-proyecto"
        type="button"
      >
        Crear proyecto
        <span class="pictograma-agregar" aria-hidden="true" />
      </button>

      <SisdaiCampoBusqueda class="m-y-3" etiqueta="Buscar un proyecto" />

      <h6 class="m-b-1">Proyectos</h6>
    </div>

    <div v-if="storeIA.existenProyectos" class="lista-chats">
      <ul class="lista-sin-estilo" style="max-height: 85vh; overflow-y: auto">
        <li v-for="proyecto in listaProyectosFiltrada" :key="proyecto.titulo">
          <div class="proyecto seleccionado p-l-4 p-r-2 p-y-1">
            <div class="proyecto-titulo m-b-1">{{ proyecto.titulo }}</div>
            <div class="proyecto-pie">
              <span>{{ proyecto.numero_contextos }} Contextos</span>
              <span>{{ proyecto.numero_fuentes }} Fuentes</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.boton-nuevo-proyecto {
  width: 100%;
}

.proyecto.seleccionado {
  border-left: var(--Escalas-Bordes-borde-8, 8px) solid
    var(--Base-Borde---borde-acento, #53323c);
  background: var(--Base-Fondo---fondo-acento, #fcf3f5);
}
</style>
