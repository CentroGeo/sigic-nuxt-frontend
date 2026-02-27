<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const storeIA = useIAStore();
const router = useRouter();

const listaChats = ref([]);
const campoBusqueda = ref('');

const nuevoChatModal = ref(null);
const seleccionProyecto = ref('');
const seleccionContexto = ref('');
const listaProyectos = ref([]);
const listaContextos = ref([]);

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);

const editarChatModal = ref(null);
const tituloChat = ref('');
const idChat = ref('');

const eliminarChatModal = ref(null);

const fechaHoy = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/**
 * Agrupa la lista del historial de chat por fecha y ordena de forma
 * descendente, así como por id. Asignando el resultado al catálogo.
 * @param {Array} historiales con la lista de chats
 */
function transformarHistorial(historiales) {
  const agrupadoPorFecha = {};

  // agrupamos por fecha
  historiales.forEach((historial) => {
    const fechaISO = historial.credate_date;
    // formatea a String la fecha de creación a la forma dd/mm/yyyy
    const fecha = new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    historial.context.forEach((contexto) => {
      // obtenemos los items del chat
      const chatItem = {
        id: historial.id,
        titulo: historial.title || 'Chat ' + historial.id,
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
    .map((fecha) => ({
      fecha: fecha,
      chat: agrupadoPorFecha[fecha].sort((a, b) => b.id - a.id), // 👈 orden por id DESC
    }));

  catalogo.value = resultado;
  catalogoFiltrado.value = resultado;
  //return resultado;
}

// Función para consultar lista de chats
const loadChatsList = async () => {
  let arrayChats = [];

  // Consulta proyectos
  arrayChats = await storeIA.getChatList();
  // console.log('arrayChats', arrayChats);
  listaChats.value = arrayChats;

  transformarHistorial(arrayChats);
};

// Función para consultar lista de proyectos
const loadProjectList = async () => {
  let arrayProjects = [];

  // Consulta proyectos
  arrayProjects = await storeIA.getProjectsList();

  listaProyectos.value = arrayProjects;
};

// Función para abrir y nevegar a la vista del chat
function openChat(chat) {
  // console.log('openChat: ', chat);
  storeIA.setChatActual(chat);
  router.push(`/ia/chat/${chat.id}/contexto/${chat.id_contexto}`);
}

// Método para abrir el modal de editar chat
function openEditModal(title, chat_id) {
  editarChatModal.value?.abrirModal();
  tituloChat.value = title;
  idChat.value = chat_id;
}

// Método para abrir el modal para remover chat
function openEliminarModal(chat_id) {
  eliminarChatModal.value?.abrirModal();
  idChat.value = chat_id;
}

// Función para consultar la lista de contexto por proyecto
const loadContexts = async (id) => {
  listaContextos.value = await storeIA.getProjectContexts(id);
};

// Método para manejar la edición del chat
const handleEdit = async () => {
  try {
    await storeIA.updateChat(tituloChat.value, idChat.value);
    await loadChatsList();

    editarChatModal.value?.cerrarModal();
  } catch (err) {
    console.error('Error al editar el chat.', err);
  }
};

// Método para manejar la eliminación de chat
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
    console.error('Error al eliminar el chat.', err);
  }
};

watch(seleccionProyecto, (nv) => {
  loadContexts(nv);
});

onMounted(() => {
  // Recuperando la lista de chats
  loadChatsList();

  // Recuperando la lista de proyectos
  loadProjectList();
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <div class="overflowYAuto">
        <div class="positionSticky">
          <div class="fondo-color-acento p-x-3 p-y-1">
            <h5>Chats</h5>
          </div>

          <div class="p-x-3 p-t-3">
            <div v-if="listaChats.length === 0">
              <button
                type="button"
                class="boton-listas boton boton-primario m-b-3"
                aria-label="Crear nuevo chat"
                disabled
              >
                Nuevo chat
              </button>

              <ClientOnly>
                <form class="campo-busqueda" @submit.prevent>
                  <input
                    id="idcampobusquedaia"
                    v-model="campoBusqueda"
                    type="search"
                    class="campo-busqueda-entrada"
                    placeholder="Buscar chats"
                    disabled
                  />
                  <button
                    class="boton-primario boton-pictograma campo-busqueda-buscar"
                    aria-label="Buscar"
                    type="button"
                    disabled
                  >
                    <span class="pictograma-buscar" aria-hidden="true" />
                  </button>
                </form>
              </ClientOnly>
            </div>
            <div v-else>
              <button
                class="boton-listas boton boton-primario"
                aria-label="Crear nuevo chat"
                type="button"
                @click="nuevoChatModal?.abrirModal()"
              >
                Nuevo chat
              </button>

              <ClientOnly>
                <SisdaiCampoBusqueda
                  class="m-y-3"
                  etiqueta="Buscar chats"
                  :catalogo="catalogo"
                  :catalogo-anidado="true"
                  catalogo-anidado-propiedad-elementos="chat"
                  propiedad-busqueda="titulo"
                  @al-filtrar="(r) => (catalogoFiltrado = r)"
                />
              </ClientOnly>
            </div>
          </div>
        </div>

        <div v-if="listaChats.length === 0">
          <div class="nota fondo-color-neutro p-2 borde-redondeado-8">
            <h6 class="m-t-0">Crea un contexto para iniciar un chat</h6>

            <p class="m-b-0">
              Después de crear un proyecto, crea un contexto para iniciar un chat. Los nuevos chats
              aparecerán en esta sección.
            </p>
          </div>
        </div>
        <div v-else>
          <h6 class="p-x-3">Selecciona un chat para empezar a interactuar con el asistente.</h6>

          <ul class="lista-sin-estilo m-x-3">
            <li v-for="grupo in catalogoFiltrado" :id="grupo.id" :key="grupo.id">
              <p class="fecha-grupo">
                {{ grupo.fecha == fechaHoy ? 'Hoy' : grupo.fecha }}
              </p>

              <ul class="lista-sin-estilo m-b-5">
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
    </template>

    <template #visualizador>
      <main id="principal">
        <div v-if="listaChats.length === 0">
          <div class="flex">
            <div class="columna-4"></div>
            <div class="columna-8 flex-vertical-centrado height-vh">
              <h2 class="texto-centrado">Analiza información con Inteligencia Artificial</h2>

              <div class="fondo-color-acento p-2 borde-redondeado-8">
                <h6 class="m-t-0">Crea un proyecto para comenzar</h6>

                <p class="m-b-0">
                  Esta herramienta está diseñada para ayudarte a analizar información científica y
                  territorial mediante chats con inteligencia artificial. Para iniciar, crea
                  proyectos temáticos, agregar información del catálogo o subir tus propios
                  archivos.
                </p>
              </div>

              <div class="texto-centrado m-t-3">
                <NuxtLink
                  class="boton-primario boton-pictograma boton-grande"
                  aria-label="Crear nuevo proyecto"
                  to="/ia/proyectos/crear-nuevo"
                >
                  Crear proyecto
                  <span class="pictograma-agregar" aria-hidden="true" />
                </NuxtLink>
              </div>
            </div>
            <div class="columna-4"></div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="nuevoChatModal">
          <template #encabezado> <h2>Nuevo chat</h2> </template>

          <template #cuerpo>
            <SisdaiSelector
              v-model="seleccionProyecto"
              etiqueta="Selecciona un proyecto"
              :es_obligatorio="true"
            >
              <option v-for="value in listaProyectos" :key="value.id" :value="value.id">
                {{ value.title }}
              </option>
            </SisdaiSelector>

            <SisdaiSelector
              v-if="seleccionProyecto !== ''"
              v-model="seleccionContexto"
              etiqueta="Selecciona un contexto"
              :es_obligatorio="true"
            >
              <option v-for="value in listaContextos" :key="value.id" :value="value.id">
                {{ value.title }}
              </option>
            </SisdaiSelector>
          </template>

          <template #pie>
            <button
              class="boton boton-primario boton-chico"
              aria-label="Iniciar chat"
              type="button"
              @click="router.push(`/ia/chat/0/contexto/${seleccionContexto}`)"
            >
              Iniciar chat
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="editarChatModal">
          <template #encabezado>
            <h4>Cambiar el nombre del chat</h4>
          </template>

          <template #cuerpo>
            <p class="texto-color-secundario m-b-1">Escribe un nuevo nombre para este chat.</p>
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
              Cancelar
            </button>
            <button type="button" class="boton-primario boton-chico" @click="handleEdit">
              Guardar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="eliminarChatModal">
          <template #encabezado>
            <h4>Eliminar chat</h4>
          </template>

          <template #cuerpo>
            <p>
              ¿Deseas eliminar este chat de forma permanente? Una vez eliminado, se borrará de la
              memoria y no se podrá recuperar.
            </p>
          </template>

          <template #pie>
            <button
              type="button"
              class="boton-secundario boton-chico"
              @click="eliminarChatModal?.cerrarModal()"
            >
              Cancelar
            </button>

            <button type="button" class="boton-primario boton-chico" @click="handleDelete">
              Eliminar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.overflowYAuto {
  height: var(--altura-consulta-esc);
  overflow-y: auto;

  .positionSticky {
    position: sticky;
    top: 0;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
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

.height-vh {
  height: var(--altura-consulta-esc);
}
</style>
