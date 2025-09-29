<script setup>
import { cleanInput } from '~/utils/consulta';

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
const { titulo, textoBoton, etiquetaBusqueda } = toRefs(props);

const storeIA = useIAStore();
const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);

const campoBusqueda = ref('');

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

function removerBusqueda() {
  campoBusqueda.value = '';
  catalogoFiltrado.value = catalogo.value;
}

watch(campoBusqueda, (nv) => {
  // filtra lista de catálogo proyectos por título
  if (nv !== '') {
    catalogoFiltrado.value = catalogoFiltrado.value.filter((resource) =>
      cleanInput(resource.title).includes(nv)
    );
  } else {
    catalogoFiltrado.value = catalogo.value;
  }
});

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
          class="boton-listas boton boton-primario m-b-3"
          aria-label="Nuevo proyecto"
          to="/ia/proyecto/nuevo"
        >
          {{ textoBoton }}
        </nuxt-link>

        <ClientOnly>
          <form class="campo-busqueda" @submit.prevent>
            <input
              id="idcampobusquedaialistas"
              v-model="campoBusqueda"
              class="campo-busqueda-entrada"
              type="search"
              :placeholder="etiquetaBusqueda"
              :disabled="!storeIA.existenProyectos"
            />
            <button
              v-if="campoBusqueda"
              class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
              aria-label="Borrar"
              type="button"
              :disabled="!storeIA.existenProyectos"
              @click="removerBusqueda"
            >
              <span aria-hidden="true" class="pictograma-cerrar" />
            </button>
            <button
              class="boton-primario boton-pictograma campo-busqueda-buscar"
              aria-label="Buscar"
              type="button"
              :disabled="!storeIA.existenProyectos"
            >
              <span class="pictograma-buscar" aria-hidden="true" />
            </button>
          </form>
        </ClientOnly>
        <p>
          {{
            storeIA.existenProyectos
              ? 'Selecciona un proyecto para ver su contenido.'
              : 'Cuando crees un proyecto, aparecerá en esta sección.'
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
