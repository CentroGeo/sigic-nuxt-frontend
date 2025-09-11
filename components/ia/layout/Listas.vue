<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import { onMounted, ref } from 'vue';

const storeIA = useIAStore();

/**
 * @typedef {Object} Props
 * @property {String} [titulo='Título'] - Indica el título de la lista.
 * @property {String} [textoBoton='Texto botón'] - Indica el texto que va en el botón.
 * @property {String} [etiquetaBusqueda=undefined] - Indica la etiqueta que va en el buscador.
 */
/** @type {Props} */
const props = defineProps({
  titulo: { type: String, default: 'Título' },
  textoBoton: { type: String, default: 'Texto botón' },
  etiquetaBusqueda: { type: String, default: undefined },
});
const { titulo, textoBoton, recursoLista, etiquetaBusqueda } = toRefs(props);

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);

const router = useRouter();
const route = useRoute();

const idSeleccionado = computed(() => storeIA.proyectoSeleccionado?.id);

// Función para consultar lista de proyectos
const loadProjectList = async () => {
  let arrayProjects = [];

  // Consulta proyectos
  arrayProjects = await storeIA.getProjectsList();

  catalogo.value = arrayProjects;
  catalogoFiltrado.value = arrayProjects;
};

onMounted(() => {
  loadProjectList();
});

function seleccionarProyecto(proyecto) {
  storeIA.seleccionarProyecto(proyecto);

  const idRutaActual = route.params.id;
  const idSeleccionado = proyecto.id.toString();

  if (route.name === 'ia-proyecto-id' && idRutaActual !== idSeleccionado) {
    router.push(`/ia/proyecto/${idSeleccionado}`);
  }
}
</script>

<template>
  <div>
    <!-- TODO: Colocar ListasProyectos -->
    <div v-if="titulo == 'Proyectos'">
      <div class="fondo-color-acento p-x-3 p-y-1">
        <h5>{{ titulo }}</h5>
      </div>
      <div class="p-x-3 p-t-3">
        <nuxt-link
          class="boton-listas boton boton-primario"
          aria-label="Nuevo proyecto"
          to="/ia/proyecto/nuevo"
        >
          {{ textoBoton }}
          <!-- <span class="pictograma-agregar" aria-hidden="true" /> -->
        </nuxt-link>

        <ClientOnly>
          <SisdaiCampoBusqueda
            class="m-y-3"
            :catalogo="recursoLista"
            :etiqueta="etiquetaBusqueda"
            propiedad-busqueda="titulo"
          />
        </ClientOnly>

        <p>
          {{
            !storeIA.existenProyectos
              ? 'Cuando crees un proyecto, aparecerá en esta sección.'
              : 'Selecciona un proyecto para ver su contenido.'
          }}
        </p>
      </div>

      <div v-if="storeIA.existenProyectos">
        <ul class="lista-chats lista-sin-estilo">
          <li
            v-for="proyecto in catalogoFiltrado"
            :key="proyecto.id"
            class="m-0"
            @click="seleccionarProyecto(proyecto)"
          >
            <div
              class="proyecto p-l-4 p-r-2 p-y-1"
              :class="{
                seleccionado: proyecto.id === idSeleccionado,
              }"
            >
              <div class="proyecto-titulo m-b-1">{{ proyecto.title }}</div>
              <div class="flex">
                <UiNumeroElementos :numero="proyecto.numero_contextos" etiqueta="Contextos" />
                <UiNumeroElementos :numero="proyecto.numero_fuentes" etiqueta="Fuentes" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.boton-listas {
  width: 100%;
  text-align: center;
  display: inline-block;
}

.proyecto {
  cursor: pointer;
  border-left: var(--Escalas-Bordes-borde-8, 8px) solid transparent;

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
