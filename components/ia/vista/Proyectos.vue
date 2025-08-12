<script setup>
import { ref } from "vue";

const storeIA = useIAStore();

const proyecto = computed(() => storeIA.proyectoSeleccionado);
const arraySources = ref([]);
const arrayContexts = ref([]);

const contextos = ref([
  {
    id: 0,
    tarjeta_img:
      "https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg",
    tarjeta_titulo: "Tecnologías para monitoreo marino",
    tarjeta_etiqueta: "5 Fuentes",
    numero_fuentes: 5
  },
  {
    id: 1,
    tarjeta_img:
      "https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg",
    tarjeta_titulo: "Zonas de riesgo ecológico marino",
    tarjeta_etiqueta: "6 Fuentes",
    numero_fuentes: 6
  }
]);

// Función para cargar las fuentesl proyecto
const loadSources = async () => {
  //arraySources = [];

  //Consulta fuentes
  arraySources.value = await storeIA.getProjectSources(proyecto.value["id"]);

  //console.log(arraySources);

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
};

// Función para cargar las contextos proyecto
const loadContexts = async () => {
  //arraySources = [];

  //Consulta fuentes
  arrayContexts.value = await storeIA.getProjectContexts(proyecto.value["id"]);

  //console.log("arrayContexts: ",arrayContexts);

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
};

//carga fuentes del proyecto inicialmente seleccionado
/* onMounted(() => {
  //console.log(proyecto.value)
  loadSources();
  loadContexts();
}); */

watch(
  proyecto,
  nuevo => {
    if (nuevo?.id) {
      loadSources();
      loadContexts();
    }
  },
  { immediate: true }
); // Esto lo ejecuta también en el primer render

// Observador carga fuentes al cambiar de proyecto
watch(proyecto, (nuevoProyecto, anteriorProyecto) => {
  //console.log("Proyecto cambió:", nuevoProyecto);
  loadSources();
  loadContexts();
});
</script>

<template>
  <div>
    <div
      v-if="proyecto"
      class="contenedor"
      style="max-height: 85vh; overflow-y: auto"
    >
      <div class="grid">
        <div class="columna-16">
          <div class="flex flex-contenido-separado proyecto-encabezado">
            <div class="flex proyecto-encabezado">
              <h2>{{ proyecto.title }}</h2>
              <p
                class="p-x-1 p-y-minimo fondo-color-acento texto-color-secundario borde borde-color-acento borde-redondeado-8"
              >
                <span>{{ proyecto.public ? "Público" : "Privado" }}</span>
                <!-- TODO: agregar icono de para privado/publico -->
                <span class="pictograma-privado" aria-hidden="true"></span>
              </p>
            </div>
            <nuxt-link
              class="boton boton-primario boton-chico"
              aria-label="Configurar proyecto"
              :to="`/ia/proyecto/${proyecto.id}`"
            >
              Configurar proyecto
            </nuxt-link>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="columna-10">
          {{ proyecto.description }}
        </div>
      </div>
      <div class="grid">
        <div class="columna-16">
          <p class="separador borde-b" />
        </div>
      </div>
      <div class="grid">
        <div
          class="flex flex-contenido-separado contexto-encabezado columna-16"
        >
          <h4>Contextos:</h4>
          <NuxtLink
            class="boton boton-secundario boton-chico"
            aria-label="Crear proyecto"
            :to="`/ia/proyecto/crea-contexto?proyecto_id=${proyecto.id}`"
          >
            Crear contexto
          </NuxtLink>
        </div>
      </div>
      <div class="grid">
        <div class="columna-16">
          <div v-if="storeIA.existeContexto">
            <div class="flex m-y-3">
              <div
                v-for="contexto in arrayContexts"
                :key="contexto.id"
                class="columna-4"
              >
                <div class="tarjeta">
                  <img
                    class="tarjeta-imagen"
                    :src="`http://localhost:8080/media/${contexto.image_type}`"
                    alt=""
                  />
                  <div class="tarjeta-cuerpo">
                    <p class="tarjeta-titulo">
                      {{ contexto.title }}
                    </p>
                    <!--                     <UiNumeroElementos
                      :numero="contexto.numero_fuentes"
                      etiqueta="Fuentes"
                    /> -->
                  </div>
                  <div class="tarjeta-pie">
                    <nuxt-link
                      class="boton-primario boton-chico"
                      type="button"
                      :to="`/ia/chat/dinamica?context_id=${contexto.id}`"
                    >
                      Iniciar chat
                      <span class="pictograma-chat" aria-hidden="true" />
                    </nuxt-link>
                    <nuxt-link
                      class="boton-secundario boton-chico"
                      type="button"
                      to="#"
                    >
                      Editar contexto
                      <span class="pictograma-editar" aria-hidden="true" />
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-contenido-centrado">
            <div class="columna-8">
              <div class="nota fondo-color-neutro p-2 borde-redondeado-8 m-t-0">
                <h6 class="m-t-0 m-b-2">
                  Aún no hay contextos en este proyecto.
                </h6>
                <p class="m-y-0">
                  Para comenzar, haz clic en "Crear contexto" y selecciona las
                  fuentes que quieres usar. Esto te permitirá activar el
                  análisis dentro del chat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="columna-16">
          <p class="separador borde-b" />
          <div class="flex flex-contenido-separado fuentes-encabezado">
            <h4>Fuentes de información:</h4>
            <div>
              <button
                class="boton-pictograma boton-secundario m-r-2"
                aria-label="Agregar del catalogo"
              >
                Agregar del catálogo
                <span class="pictograma-agregar" aria-hidden="true" />
              </button>
              <button
                class="boton-pictograma boton-secundario"
                aria-label="Subir archivos"
              >
                Subir archivos
                <span class="pictograma-archivo-subir" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="tabla-archivos m-t-3" v-if="arraySources.length > 0">
            <table class="tabla">
              <thead>
                <tr>
                  <th class="p-x-3 p-y-2">Nombre</th>
                  <th class="p-x-3 p-y-2">Tipo de archivo</th>
                  <!--         <th>Categoría</th>
        <th>Origen</th>
        <th>Acciones</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="archivo in arraySources" :key="archivo.id">
                  <td class="p-3">{{ archivo.filename }}</td>
                  <td class="p-3">{{ archivo.document_type }}</td>
                  <!--         <td>{{ archivo.categoria }}</td>
        <td>{{ archivo.origen }}</td> -->
                  <!--         <td>
          <button
            class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
            aria-label="Eliminar archivo"
            @click="eliminarArchivo(archivo.id)"
          >
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.tarjeta {
  background-color: var(--fondo-neutro);
  .tarjeta-imagen {
    height: 120px;
  }
  .tarjeta-pie {
    display: inline-grid;
    a {
      display: flex;
      justify-content: space-between;
    }
  }
}

.proyecto-encabezado {
  align-items: center;
}

// .proyecto-estado {
//   // border-radius: var(--Escalas-Bordes-redondeados-br-2, 8px);
//   // border: 1px solid var(--Base-Borde---borde-acento, #53323c);
//   // background: var(--fondo-acento);
// }

.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.contexto-encabezado {
  align-items: center;
}
</style>
