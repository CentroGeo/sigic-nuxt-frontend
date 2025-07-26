<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref, onMounted } from "vue";

const storeIA = useIAStore();

const props = defineProps({
  titulo: { type: String, default: "Título" },
  textoBoton: { type: String, default: "Título" },
  etiquetaBusqueda: { type: String, default: undefined },
  // recursoLista: { type: Array, required: true },
});
const { titulo, textoBoton, recursoLista, etiquetaBusqueda } = toRefs(props);

const catalogo = ref([
  {
    id: 0,
    titulo: "Biodiversidad de ecosistemas marinos",
    numero_contextos: 0,
    numero_fuentes: 9,
  },
   {
     id: 1,
     titulo: "Nombre del proyecto",
     numero_contextos: 5,
     numero_fuentes: 5,
   },
   {
     id: 2,
     titulo: "Nombre del proyecto",
     numero_contextos: 5,
     numero_fuentes: 5,
   },   
]);

const catalogoFiltrado = ref(catalogo.value);


// Función para guardar el proyecto
const loadProjectList = async () => {

  let arrayProjects = []
   //consulta proyectos
   arrayProjects = await storeIA.getProjectsList()

   console.log(arrayProjects)
};


onMounted(() => {
  loadProjectList();
});

</script>

<template>
  <div>
    <!-- TODO: Colocar ListasProyectos -->
    <div v-if="titulo == 'Proyectos'">
      <div style="max-height: 85vh; overflow-y: auto" class="p-x-3 p-t-3">
        <nuxt-link
          style="width: 100%; text-align: center; display: inline-block"
          class="boton boton-primario"
          aria-label="Crear proyecto"
          to="/ia/proyecto/crea-proyecto"
        >
          {{ textoBoton }}
          <span class="pictograma-agregar" aria-hidden="true" />
        </nuxt-link>

        <ClientOnly>
          <SisdaiCampoBusqueda
            style="width: 100%"
            class="m-y-3"
            :catalogo="recursoLista"
            :etiqueta="etiquetaBusqueda"
            propiedad-busqueda="titulo"
          />
        </ClientOnly>

        <h6>{{ titulo }}</h6>
      </div>

      <div v-if="storeIA.existenProyectos">
        <ul class="lista-chats lista-sin-estilo">
          <li
            v-for="proyecto in catalogoFiltrado"
            :key="proyecto.id"
            class="m-0"
          >
            <div class="proyecto seleccionado p-l-4 p-r-2 p-y-1">
              <div class="proyecto-titulo m-b-1">{{ proyecto.titulo }}</div>
              <div class="flex">
                <UiNumeroElementos
                  :numero="proyecto.numero_contextos"
                  etiqueta="Contextos"
                />
                <UiNumeroElementos
                  :numero="proyecto.numero_fuentes"
                  etiqueta="Fuentes"
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.lista-chats {
  max-height: 85vh;
  overflow-y: auto;
}

.proyecto {
  &.seleccionado {
    border-left: var(--Escalas-Bordes-borde-8, 8px) solid var(--borde-acento);
    background: var(--fondo-acento);
  }

  .proyecto-titulo {
    color: var(--navegacion-secundaria-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }
}
</style>
