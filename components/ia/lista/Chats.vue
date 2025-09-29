<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

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

const nuevoChatModal = ref(null);
const seleccionProyecto = ref('');
const seleccionContexto = ref('');

const router = useRouter();

const editarChatModal = ref(null);
const tituloChat = ref('');
const idChat = ref('');

const fechaHoy = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const catalogo = ref([]);
// const catalogoFiltrado = ref(catalogo.value);
const catalogoFiltrado = ref([
  {
    id: 0,
    fecha: '23/09/2025',
    chat: [{ id: 0, id_contexto: 0, titulo: 'titulo', proyecto: 'proyecto', contexto: 'contexto' }],
  },
]);

const eliminarChatModal = ref(null);

// Función para consultar lista de proyectos
const loadChatsList = async () => {
  let arrayChats = [];

  // Consulta proyectos
  arrayChats = await storeIA.getChatList(1);
  console.log(arrayChats);
  console.log('storeIA.chats', storeIA.chats);

  transformarHistorial(arrayChats);
};

/**
 * Agrupa la lista del historial de chat por fecha y ordena de forma
 * descendente, así como por id. Asignando el resultado al catálogo.
 * @param {Array} historiales con la lista de chats
 */
function transformarHistorial(historiales) {
  const agrupadoPorFecha = {};
  console.log('historiales', historiales);

  // agrupamos por fecha
  historiales.forEach((historial) => {
    const fechaISO = historial.credate_date;
    // formatea a String la fecha de creación a la forma dd/mm/yyyy
    const fecha = new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    // console.log('fecha', fecha);

    historial.context.forEach((contexto) => {
      // obtenemos los items del chat
      const chatItem = {
        id: historial.id,
        titulo: historial.title || 'Chat ' + historial.id,
        proyecto: contexto.workspace?.title || '',
        contexto: contexto.title || '',
        id_contexto: contexto.id || '',
      };
      // console.log('chatItem', chatItem);

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
    .map((fecha) => ({
      fecha: fecha,
      chat: agrupadoPorFecha[fecha].sort((a, b) => b.id - a.id), // 👈 orden por id DESC
    }));

  catalogo.value = resultado;
  catalogoFiltrado.value = resultado;
  //return resultado;
}

function openChat(chat) {
  //console.log("openChat: ",chat)
  storeIA.setChatActual(chat);

  router.push({
    path: '/ia/chat/dinamica',
    query: {
      chat_id: chat.id,
      context_id: chat.id_contexto,
    },
  });
}

function openEditModal(title, chat_id) {
  editarChatModal.value?.abrirModal();
  tituloChat.value = title;
  idChat.value = chat_id;
}

onMounted(() => {
  loadChatsList();
});

function openEliminarModal(chat_id) {
  eliminarChatModal.value?.abrirModal();
  idChat.value = chat_id;
}

const handleDelete = async () => {
  try {
    const chatId = idChat.value; // 🔸 Usamos el valor reactivo
    if (!chatId) return;

    const chatActual = storeIA.chatActual;
    const route = router.currentRoute.value;

    const estaEnChat = route.path === '/ia/chat/dinamica';
    const esChatActual = chatActual && chatActual.id === chatId;
    const esNuevoChatSinId = estaEnChat && (!chatActual || !chatActual.id);

    await storeIA.deleteChat(chatId);
    await loadChatsList();

    if (esChatActual || esNuevoChatSinId) {
      storeIA.clearChatActual();
      router.push('/ia/chats');
    }

    eliminarChatModal.value?.cerrarModal();

    idChat.value = null;
  } catch (err) {
    console.error('Error al eliminar el chat.');
    console.log(err);
  }
};

watch(
  () => storeIA.chatsVersion,
  () => {
    loadChatsList();
  }
);
</script>

<template>
  <div>
    <div v-if="storeIA.existenProyectos">
      <div v-if="titulo == 'Chats'">
        <div class="fondo-color-acento p-x-3 p-y-1">
          <h5>{{ titulo }}</h5>
        </div>
        <div class="p-x-3 p-t-3">
          <button
            class="boton-listas boton boton-primario"
            aria-label="Crear nuevo chat"
            type="button"
            @click="nuevoChatModal?.abrirModal()"
          >
            {{ textoBoton }}
          </button>

          <ClientOnly>
            <SisdaiCampoBusqueda
              class="m-y-3"
              :etiqueta="etiquetaBusqueda"
              :catalogo="recursoLista"
              :catalogo-anidado="true"
              catalogo-anidado-propiedad-elementos="chat"
              propiedad-busqueda="titulo"
              @al-filtrar="(r) => (catalogoFiltrado = r)"
            />
          </ClientOnly>

          <h6>Selecciona un chat para empezar a interactuar con el asistente.</h6>

          <ul class="lista-sin-estilo">
            <li v-for="grupo in catalogoFiltrado" :id="grupo.id" :key="grupo.id">
              <p class="fecha-grupo">
                {{ grupo.fecha == fechaHoy ? 'Hoy' : grupo.fecha }}
              </p>

              <ul class="lista-sin-estilo">
                <li v-for="chat in grupo.chat" :id="chat.id" :key="chat.id">
                  <div class="tarjeta-chat p-3 borde borde-redondeado-20" @click="openChat(chat)">
                    <h5 class="tarjeta-titulo m-t-0 m-b-2">
                      {{ chat.titulo }}
                    </h5>
                    <p class="tarjeta-nombre-proyecto m-t-0 m-b-1">
                      {{ chat.proyecto }}
                    </p>
                    <p class="tarjeta-nombre-contexto m-t-0 m-b-2">
                      {{ chat.contexto }}
                    </p>

                    <div class="flex flex-contenido-final">
                      <div>
                        <button
                          class="boton-pictograma boton-sin-contenedor-secundario"
                          aria-label="Editar chat"
                          type="button"
                          @click.stop="openEditModal(chat.titulo, chat.id)"
                        >
                          <span class="pictograma-editar" aria-hidden="true" />
                        </button>
                        <button
                          class="boton-pictograma boton-sin-contenedor-secundario"
                          aria-label="Remover chat"
                          type="button"
                          @click.stop="openEliminarModal(chat.id)"
                        >
                          <span class="pictograma-eliminar" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
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
        <button class="boton-primario boton-chico" aria-label="Iniciar chat" type="button">
          Iniciar chat
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>

  <ClientOnly>
    <SisdaiModal ref="editarChatModal">
      <template #encabezado>
        <h2>Editar título de chat</h2>
      </template>

      <template #cuerpo>
        <p>Ingresa el nuevo título del chat</p>
        <SisdaiCampoBase
          v-model="tituloChat"
          etiqueta="Título del chat"
          ejemplo="Escribe el título de tu chat"
          :es_etiqueta_visible="false"
          class="m-b-3"
        />
      </template>

      <template #pie>
        <button
          type="button"
          class="boton-secundario boton-chico"
          @click="editarChatModal?.cerrarModal()"
        >
          Cerrar
        </button>
        <button
          type="button"
          class="boton-primario boton-chico"
          @click="storeIA.updateChat(tituloChat, idChat)"
        >
          Guardar
        </button>
      </template>
    </SisdaiModal>

    <SisdaiModal ref="eliminarChatModal">
      <template #encabezado>
        <h2>Eliminar chat</h2>
      </template>

      <template #cuerpo>
        <p>¿Desea eliminar este chat? Esta acción no se puede deshacer.</p>
      </template>

      <template #pie>
        <button
          type="button"
          class="boton-secundario boton-chico"
          @click="eliminarChatModal?.cerrarModal()"
        >
          No
        </button>
        <button type="button" class="boton-primario boton-chico" @click="handleDelete">Si</button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss">
.boton-listas {
  width: 100%;
  text-align: center;
  display: inline-block;
}

.tarjeta-chat {
  background-color: var(--fondo-acento);
  border: 1px solid var(--borde-acento);
  width: 100%;
  cursor: pointer;
  a {
    &:hover {
      text-decoration: none !important;
      background-color: var(--fondo-acento);
      border-color: var(--borde-acento);
      box-shadow: none;
      color: inherit;
    }
  }
  h5 {
    color: var(--texto-acento);
  }
  p {
    color: var(--texto-primario);
  }

  .tarjeta-titulo {
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: var(--Tipos-Interlineado-Ttulos-y-subttulos-Nivel-6, 22.5px);
  }

  .tarjeta-nombre-proyecto,
  .tarjeta-nombre-contexto {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18.2px;
  }
}
</style>
