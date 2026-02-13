<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import DOMPurify from 'dompurify'; // Para seguridad XSS
import { marked } from 'marked'; // Importar marked para mostrar formato markdown

const { data } = useAuth();
const config = useRuntimeConfig();

const storeIA = useIAStore();
const router = useRouter();
const route = useRoute();

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

// Agregar nueva referencia para el contenedor del chat
const contenedorChatRef = ref(null);
const usuarioHizoScroll = ref(false);

const mensaje = ref('');
const mensajes = ref([]);

const reporteModal = ref(null);
const controlDeslizante = ref(null);
const areaTextoRef = ref(null);
const isSubmitting = ref(false);

const chatID = computed(() => parseInt(route.params.id));
const contextID = computed(() => parseInt(route.params.idx));

const idAleatorio = () => {
  return 'areatexto-' + Math.random().toString(36).substring(2);
};
const idAleatorioCD = () => {
  return 'controldeslizante-' + Math.random().toString(36).substring(2);
};

// Función para cargar historico de chat
async function loadExistentChat(idchat) {
  //Consulta fuentes
  const historyChat = await storeIA.getChat(idchat);

  const historial_chat = historyChat['history_array'];

  mensajes.value = historial_chat.map((item, index) => {
    return {
      id: index,
      actor: item.role === 'user' ? 'Humano' : 'AI',
      message: item.content,
      reporte: false, // puedes cambiar esta lógica si necesitas condicionar
    };
  });
}

if (contextID.value) {
  if (chatID.value > 0) {
    console.log('chat existente');
    loadExistentChat(chatID.value);
  }
} else {
  console.log('Chat no válido');
}

// Configurar marked (opcional)
marked.setOptions({
  breaks: true, // Convertir saltos de línea en <br>
  gfm: true, // Habilitar GitHub Flavored Markdown
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
  console.log('arrayChats', arrayChats);

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
  console.log('openChat: ', chat);
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
    console.error('Error al editar el chat.');
    console.log(err);
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
    console.error('Error al eliminar el chat.');
    console.log(err);
  }
};

// Función para manejar el scroll del usuario
function manejarScroll() {
  const contenedor = contenedorChatRef.value;
  if (contenedor) {
    // Verificamos si el usuario está cerca del fondo (con un margen de 100px)
    const cercaDelFondo =
      contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight - 100;
    usuarioHizoScroll.value = !cercaDelFondo;
  }
}

// Función para convertir markdown a HTML seguro
function renderMarkdown(content) {
  return DOMPurify.sanitize(marked.parse(content));
}

function enfocarAreaTexto() {
  areaTextoRef.value.focus();
}

// Función para hacer scroll al final solo si el usuario no ha hecho scroll manual
function scrollToBottomIfNeeded() {
  nextTick(() => {
    if (contenedorChatRef.value && !usuarioHizoScroll.value) {
      contenedorChatRef.value.scrollTo({
        top: contenedorChatRef.value.scrollHeight,
        behavior: 'smooth',
      });
    }
  });
}

// Método para manejar el mensaje que se somete al chat
const submitMensaje = async () => {
  if (isSubmitting.value || mensaje.value.trim() === '') return;

  const userEmail = data.value?.user.email;
  const token = data.value?.accessToken;

  const resultado = ref('');
  const loading = ref(false);

  isSubmitting.value = true;

  // Configuración inicial del chat
  const body = {
    user_id: userEmail,
    //type: "Preguntar",
    type: 'RAG',
    //context_id: parseInt(contextId),
    context_id: contextID.value,
    //context_id: 9,
    // model: 'deepseek-r1',
    // model: 'qwen2:1.5b',
    model: config.public.ollamaModel,
    //model: "llama3.1",
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente amable que puede ayudar al usuario. Responde de manera cordial. Responde siempre en español.',
      },
      { role: 'user', content: mensaje.value },
    ],
    think: false,
    chat_id: chatID.value,
  };

  // Agregar mensaje del usuario
  mensajes.value.push({
    id: mensajes.value.length + 1,
    actor: 'Humano',
    message: mensaje.value,
  });
  mensaje.value = '';

  // Agregar mensaje vacío de la IA que se actualizará en el streaming
  const aiMessageIndex =
    mensajes.value.push({
      id: mensajes.value.length + 1,
      actor: 'AI',
      message: '',
    }) - 1; // Obtenemos el índice del nuevo mensaje

  // Envía la pregunta
  const res = await fetch(`${config.public.iaBackendUrl}/queue/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  //console.log(res)
  if (!res.ok) {
    //resultado.value = 'Error al iniciar solicitud.'
    mensajes.value[aiMessageIndex].message = 'Error al iniciar solicitud.';
    loading.value = false;
    isSubmitting.value = false;
    return;
  }

  const json = await res.json();

  const jobId = json.job_id;

  if (json['chat_id'] !== null && json['chat_id'] !== undefined) {
    chatID.value = json['chat_id'];

    storeIA.triggerChatsReload();
  }

  if (!jobId) {
    //resultado.value = 'No se recibió job_id.'
    mensajes.value[aiMessageIndex].message = 'No se recibió job_id.';
    loading.value = false;
    isSubmitting.value = false;
    return;
  } else {
    /* console.log('jobId: ', jobId); */
  }

  // Resetear el flag al enviar nuevo mensaje
  usuarioHizoScroll.value = false;

  // Hacer scroll inicial al nuevo mensaje
  scrollToBottomIfNeeded();

  let mensajeRespuesta = '';
  // Hacer streaming de la respuesta
  try {
    // const token = data.value?.accessToken;

    const streamRes = await fetch(`${config.public.iaBackendUrl}/queue/stream/${jobId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    const reader = streamRes.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!reader) {
      //resultado.value = 'No se pudo leer el stream.'
      mensajes.value[aiMessageIndex].message = 'No se pudo leer el stream.';
      loading.value = false;
      return;
    } else {
      //console.log(reader)
    }

    //muestra la respuesta del modelo en streaming
    while (true) {
      const { done, value } = await reader.read();
      //console.log(done)
      if (done) break;
      const chunk = decoder.decode(value);
      //resultado.value += chunk
      //console.log("chunk:",chunk)
      resultado.value = chunk;
      //console.log(resultado.value)

      const arrayResults = resultado.value.split('\n\n');
      //console.log(arrayResults)

      arrayResults.forEach((resultElement) => {
        //console.log(resultElement)
        if (resultElement.includes('status:')) {
          try {
            //const statusStr = resultElement.replace('status:', '');
            //const statusObj = JSON.parse(statusStr);
            //console.log(statusObj["status"])
          } catch (err) {
            console.log('Error Leyendo status: ' + err);
            console.log(resultElement);
          }
        }

        if (resultElement.includes('event: done')) {
          //let statusStr=resultElement.replace("status:","")
          //let statusObj=JSON.parse(statusStr)
          //console.log(statusObj)
        }

        if (resultElement.includes('data:')) {
          if (resultElement.includes('STREAM_COMPLETED')) {
            /* console.log('stream completado'); */
          } else {
            try {
              const dataStr = resultElement.replace('data:', '');
              //console.log(dataStr)
              const dataObj = JSON.parse(dataStr);
              //console.log(dataObj)
              if (dataObj['status'] === 'started') {
                //console.log(dataObj['message'])
                mensajeRespuesta += dataObj['message'];
                //console.log(mensajeRespuesta)
                mensajes.value[aiMessageIndex].message = mensajeRespuesta;

                // Hacer scroll después de cada actualización
                scrollToBottomIfNeeded();
              }
            } catch (err) {
              console.log('Error Leyendo data: ' + err);
              console.log(resultElement);
            }
          }
        }
      });
    }
  } catch (err) {
    //resultado.value = 'Error en el streaming: ' + err
    //mensajes.value[aiMessageIndex].message = 'Error en el streaming: ' + err
    console.log('Error en el streaming: ' + err);
    console.log(mensajeRespuesta);

    scrollToBottomIfNeeded();
  } finally {
    isSubmitting.value = false;

    storeIA.triggerChatsReload();
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
      <div>
        <div class="overflowYAuto">
          <div class="positionSticky">
            <div class="fondo-color-acento p-x-3 p-y-1">
              <h5>Chats</h5>
            </div>

            <div class="p-x-3 p-t-3">
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

          <div>
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
      </div>
    </template>

    <template #visualizador>
      <main id="principal" class="">
        <div class="grid">
          <div class="columna-2" />
          <div class="columna-12">
            <div class="contenedor-chat">
              <div class="contenedor-chat-contenido">
                <div ref="contenedorChatRef" class="contenedor-log" @scroll="manejarScroll">
                  <div v-for="m in mensajes" :key="m.id">
                    <div :class="m.actor == 'Humano' ? 'p-y-2 ' : ''">
                      <div
                        class="contenedor-log-contenido"
                        :style="m.actor == 'Humano' ? 'flex-direction:row-reverse' : ''"
                      >
                        <div>
                          <span
                            class="pictograma-grande p-1 borde-redondeado-8"
                            :class="m.actor == 'Humano' ? 'pictograma-persona' : 'pictograma-bot'"
                            style="background-color: var(--boton-primario-deshabilitado-fondo)"
                          />
                        </div>
                        <div>
                          <!-- Mensaje chat -->
                          <!--                     <p
                      class="m-0 markdown-content"
                      :class="
                        m.actor == 'Humano' ? 'fondo-color-neutro p-2 borde-redondeado-20' : ''
                      "
                      :style="m.actor == 'Humano' ? 'max-width: 592px' : ''"
                    >
                      {{ m.message }}
                      
                    </p> -->

                          <!-- Mensaje chat con markdown -->
                          <!-- TO DO: corregir altura de contenedor de mensaje  -->
                          <!-- eslint-disable vue/no-v-html -->
                          <div
                            class="m-0 markdown-content"
                            :class="
                              m.actor == 'Humano'
                                ? 'fondo-color-neutro p-2 borde-redondeado-20'
                                : ''
                            "
                            :style="m.actor == 'Humano' ? 'max-width: 592px' : ''"
                            v-html="renderMarkdown(m.message)"
                          ></div>
                          <!-- eslint-enable -->

                          <!-- Reporte -->
                          <div v-if="m.actor == 'AI' && m.reporte" class="">
                            <p>
                              ¿Te gustaría que genere un reporte con esta información o prefieres
                              seguir consultando?
                            </p>
                            <div class="flex">
                              <!-- Abril modal -->
                              <button
                                class="boton-primario boton-chico"
                                aria-label="Generar reporte"
                                type="button"
                                @click="reporteModal?.abrirModal()"
                              >
                                Generar reporte
                                <span class="pictograma-reporte" aria-hidden="true" />
                              </button>
                              <!-- Enfocar Area Texto -->
                              <button
                                class="boton-secundario boton-chico"
                                aria-label="Seguir consultando"
                                type="button"
                                @click="enfocarAreaTexto()"
                              >
                                Seguir consultando
                                <span class="pictograma-actualizar" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="contenedor-area-texto m-b-5">
                  <ClientOnly>
                    <form class="formulario-area-texto">
                      <label :for="idAleatorio" class="a11y-solo-lectura">
                        Nombre de la etiqueta
                      </label>

                      <textarea
                        :id="idAleatorio"
                        ref="areaTextoRef"
                        v-model="mensaje"
                        tabindex="0"
                        rows="1"
                        placeholder="Envía un mensaje"
                        :disabled="isSubmitting"
                        @keypress.enter.exact.prevent="submitMensaje()"
                      />

                      <div class="formulario-boton">
                        <button
                          class="boton-pictograma boton-con-contenedor-primario"
                          aria-label="Enviar mensaje"
                          :disabled="mensaje == '' || isSubmitting"
                          type="button"
                          @click.prevent="submitMensaje()"
                        >
                          <span class="pictograma-flecha-arriba" aria-hidden="true" />
                        </button>
                      </div>
                    </form>
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>

          <div class="columna-2" />
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
              :disabled="seleccionContexto === ''"
            >
              Iniciar chat
            </button>
            <!-- <button
              class="boton boton-primario boton-chico"
              aria-label="Iniciar chat"
              type="button"
              :disabled="seleccionContexto === ''"
              @click="router.push(`/ia/chat/dinamica?context_id=${seleccionContexto}`)"
            >
              Iniciar chat
            </button> -->
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

        <SisdaiModal ref="reporteModal">
          <template #encabezado>
            <h2>
              {{
                controlDeslizante?.valor_seleccionado < 100 ? 'Creando reporte' : 'Reporte listo'
              }}
            </h2>
          </template>

          <template #cuerpo>
            <div>
              <p v-if="controlDeslizante?.valor_seleccionado < 100">
                Tu archivo se está creando espera a que la barra de progreso se complete
              </p>
              <div
                v-if="controlDeslizante?.valor_seleccionado < 100"
                class="fondo-color-informacion p-x-2 p-y-1 borde borde-color-informacion borde-redondeado-20"
              >
                <p class="texto-color-informacion">
                  <span class="pictograma-informacion" />
                  Verifica siempre los datos antes de usarlos.
                </p>
              </div>
              <div
                v-else-if="controlDeslizante?.valor_seleccionado == 100"
                class="fondo-color-confirmacion p-x-2 p-y-1 borde borde-color-confirmacion borde-redondeado-20"
              >
                <p class="texto-color-confirmacion">
                  <span class="pictograma-aprobado" />
                  Tu reporte está listo para descagar
                </p>
              </div>
            </div>
            <div>
              <p>Creando reporte.pdf</p>

              <div>
                <ClientOnly>
                  <SisdaiControlDeslizante
                    :id="idAleatorioCD"
                    ref="controlDeslizante"
                    :val_min="0"
                    :val_max="100"
                    :val_entrada="90"
                    step="10"
                    @blur="false"
                    @update:val_entrada="
                      ($event) => (controlDeslizante.valor_seleccionado = $event)
                    "
                  />
                </ClientOnly>
                <div class="flex flex-contenido-final">
                  <label :for="idAleatorioCD"
                    >{{ controlDeslizante?.valor_seleccionado < 100 ? 'Progreso' : 'Completado' }}
                    {{ controlDeslizante?.valor_seleccionado }}%</label
                  >
                </div>
              </div>
            </div>
          </template>

          <template #pie>
            <button
              class="boton-primario boton-chico"
              aria-label="Descargar reporte"
              type="button"
              :disabled="controlDeslizante?.valor_seleccionado < 100"
            >
              Descargar reporte
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
.contenedor-chat {
  height: var(--altura-consulta-esc);
  .contenedor-chat-contenido {
    height: 100%;
    position: relative;
    .contenedor-log {
      position: absolute;
      top: 24px;
      left: 0;
      right: 0;
      height: calc(100% - 120px - 112px);
      overflow-y: auto;
      .contenedor-log-contenido {
        display: flex;
        gap: 24px;
      }
    }

    .contenedor-area-texto {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      form.formulario-area-texto {
        position: relative;
        width: 100%;
        .formulario-boton {
          position: absolute;
          bottom: 8px;
          right: 16px;
        }
      }
    }
  }
}

/* Estilos para el markdown */
.markdown-content {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.4em;
  }
  h3 {
    font-size: 1.3em;
  }

  p {
    margin: 0;
    /* line-height: 1.5; */
  }

  ul,
  ol {
    margin-bottom: 1em;
    padding-left: 2em;
  }

  li {
    margin-bottom: 0.5em;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  code {
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  pre {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid #ccc;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
  }

  a {
    color: var(--boton-primario-fondo);
    text-decoration: underline;
  }
}

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
</style>
