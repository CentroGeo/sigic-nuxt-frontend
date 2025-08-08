<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";
import { useRouter } from 'vue-router'

const router = useRouter()
const storeIA = useIAStore();

const props = defineProps({
  titulo: { type: String, default: "Título" },
  textoBoton: { type: String, default: "Título" },
  etiquetaBusqueda: { type: String, default: undefined },
  // recursoLista: { type: Array, required: true },
});
const { titulo, textoBoton, recursoLista, etiquetaBusqueda } = toRefs(props);

const nuevoChatModal = ref(null);
const seleccionProyecto = ref("");
const seleccionContexto = ref("");

// const fechaHoy = new Date();
const fechaHoy = "01-07-2025";

const catalogo = ref([]);
/* 
const catalogo = ref([
  {
    fecha: "01-07-2025",
    chat: [
      {
        id: 0,
        titulo: "Cobertura e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
    ],
  },
  {
    fecha: "01-06-2025",
    chat: [
      {
        id: 1,
        titulo: "Análisis e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
      {
        id: 2,
        titulo: "Diseño e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
    ],
  },
]);
 */
const catalogoFiltrado = ref(catalogo.value);

// Función para consultar lista de proyectos
const loadChatsList = async () => {
  let arrayChats = [];

  // Consulta proyectos
  arrayChats = await storeIA.getChatList(1);

  console.log(arrayChats);
  transformarHistorial(arrayChats)

/*   catalogo.value = arrayProjects;
  catalogoFiltrado.value = arrayProjects; */
};


function transformarHistorial(historiales) {
  const agrupadoPorFecha = {};

  historiales.forEach(historial => {
    const fechaISO = historial.credate_date;
    const fecha = new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    historial.context.forEach(contexto => {
      const chatItem = {
        id: historial.id,
        titulo: 'Chat '+historial.id || '',
        proyecto: contexto.workspace?.title || '',
        contexto: contexto.title || '',
        id_contexto: contexto.id || '',
      };

      if (!agrupadoPorFecha[fecha]) {
        agrupadoPorFecha[fecha] = [];
      }

      agrupadoPorFecha[fecha].push(chatItem);
    });
  });

  // Convertir el objeto en un array ordenado por fecha descendente
  const resultado = Object.keys(agrupadoPorFecha)
    .sort((a, b) => {
      // Comparar fechas como objetos Date
      const [da, ma, ya] = a.split('-');
      const [db, mb, yb] = b.split('-');
      return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    })
    .map(fecha => ({
      fecha: fecha,
      chat: agrupadoPorFecha[fecha].sort((a, b) => b.id - a.id) // 👈 orden por id DESC
    }));

  catalogo.value = resultado;
  catalogoFiltrado.value = resultado;

  //return resultado;
}



onMounted(() => {
  loadChatsList();
});

</script>

<template>
  <div>
    <div v-if="storeIA.existenProyectos">
      <div v-if="titulo == 'Chats'">
        <div style="max-height: 85vh; overflow-y: auto" class="p-x-3 p-t-3">
          <button
            style="width: 100%; text-align: center; display: inline-block"
            class="boton-primario"
            aria-label="Crear nuevo chat"
            type="button"
            @click="nuevoChatModal?.abrirModal()"
          >
            {{ textoBoton }}
          </button>

          <ClientOnly>
            <SisdaiCampoBusqueda
              style="width: 100%"
              class="m-y-3"
              :etiqueta="etiquetaBusqueda"
              :catalogo="recursoLista"
              :catalogo-anidado="true"
              catalogo-anidado-propiedad-elementos="chat"
              propiedad-busqueda="titulo"
              @al-filtrar="(r) => (catalogoFiltrado = r)"
            />
          </ClientOnly>

          <h6>{{ titulo }}</h6>
          <!-- <div v-for="grupos in catalogoFiltrado">
            {{ grupos }}
          </div> -->
<ul class="lista-sin-estilo">
  <li
    v-for="grupo in catalogoFiltrado"
    :id="grupo.id"
    :key="grupo.id"
  >
    <p class="fecha-grupo">
      {{ grupo.fecha == fechaHoy ? "Hoy" : grupo.fecha }}
    </p>

    <ul class="lista-sin-estilo tarjetas-grid">
      <li v-for="chat in grupo.chat" :id="chat.id" :key="chat.id">
        <nuxt-link
          class="tarjeta-chat"
          :to="{
            path: '/ia/chat/dinamica',
            query: {
              chat_id: chat.id,
              context_id: chat.id_contexto
            }
          }"
        >
          <div class="contenido-chat">
            <h5 class="tarjeta-titulo">{{ chat.titulo }}</h5>
            <p class="tarjeta-nombre-proyecto">{{ chat.proyecto }}</p>
            <p class="tarjeta-nombre-contexto">{{ chat.contexto }}</p>

            <div class="acciones-chat">
              <nuxt-link class="boton-pictograma" to="#">
                <span class="pictograma-editar" aria-hidden="true" />
              </nuxt-link>
              <button
                class="boton-pictograma"
                aria-label="Remover chat"
                type="button"
              >
                <span class="pictograma-eliminar" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nuxt-link>
      </li>
    </ul>
  </li>
</ul>
        </div>
      </div>
    </div>
  </div>
  <ClientOnly>
    <SisdaiModal ref="nuevoChatModal">
      <template #encabezado> <h2>Nuevo chat</h2> </template>
      <template #cuerpo>
        <SisdaiSelector
          v-model="seleccionProyecto"
          etiqueta="Selecciona un proyecto"
          texto_ayuda="Texto de ayuda."
        >
          <option value="1">Opcion Uno</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
        <SisdaiSelector
          v-model="seleccionContexto"
          etiqueta="Selecciona un contexto"
          texto_ayuda="Texto de ayuda."
        >
          <option value="1">Opcion Uno</option>
          <option value="2">Opcion Dos</option>
          <option value="3">Opcion Tres</option>
        </SisdaiSelector>
      </template>
      <template #pie>
        <button
          class="boton-primario boton-chico"
          aria-label="Iniciar chat"
          type="button"
        >
          Iniciar chat
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss">

.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* columnas adaptables */
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.tarjetas-grid li {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tarjeta-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  
  border-radius: 12px;
  padding: 1rem;
  box-sizing: border-box;
  text-decoration: none;
  background-color: var(--fondo-acento);
  border: 1px solid var(--borde-acento);
  h5 {
    color: var(--texto-acento);
  }
  p {
    color: var(--texto-primario);
  }  
}

.contenido-chat {
  flex-grow: 1; /* esto fuerza que todos crezcan igual */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.acciones-chat {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: auto; /* empuja hacia abajo */
}

.tarjeta-titulo,
.tarjeta-nombre-proyecto,
.tarjeta-nombre-contexto {
  margin-bottom: 0.25rem; /* o 4px */
  line-height: 1.2;
}

.tarjeta-nombre-contexto {
  margin-bottom: 0; /* última línea sin espacio extra */
}

</style>
