<script setup>
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import DOMPurify from 'dompurify'; // Para seguridad XSS
import { marked } from 'marked'; // Importar marked para mostrar formato markdown
import { defineProps, ref, watch } from 'vue';

const storeIA = useIAStore();

const reporteModal = ref(null);
const controlDeslizante = ref(null);
const areaTextoRef = ref(null);
const isSubmitting = ref(false);

const chatID = ref(0);
const contextID = ref(0);

const config = useRuntimeConfig();

/**
 * @typedef {Object} Props
 * @property {String} [contextId=''] - Indica el identificador del contexto.
 * @property {String} [chatId=''] - Indica el identificador del chat.
 */
/** @type {Props} */
const { contextId, chatId } = defineProps({
  contextId: { type: String, default: '' },
  chatId: { type: String, default: '' },
});

if (contextId) {
  console.log('contextId:', contextId);
  console.log('chatId:', chatId);
  contextID.value = parseInt(contextId); // Asegura que sea número si es necesario
  chatID.value = parseInt(chatId);
  console.log(contextID.value);
  console.log(chatID.value);

  if (chatID.value > 0) {
    console.log('chat existente');
    loadExistentChat(chatID.value);
  }
} else {
  console.log('Chat no válido');
}

watch(
  () => chatId,
  (nuevoValor) => {
    chatID.value = Number(nuevoValor || 0);
    console.log('chat existente');
    if (nuevoValor > 0) {
      loadExistentChat(nuevoValor);
    }
  }
);

watch(
  () => contextId,
  (nuevoValor) => {
    contextID.value = Number(nuevoValor || 0);
  }
);

/* watch(chatId, (nuevoValor, valorAnterior) => {
  console.log('chatId cambió de', valorAnterior, 'a', nuevoValor);

  // Aquí puedes realizar alguna acción cada vez que cambie
  // Por ejemplo:
  // cargarHistorialDeChat(nuevoValor);
});
 */

// Función para cargar historico de chat
async function loadExistentChat(idchat) {
  console.log('loadExistentChat');
  //arraySources = [];
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

  //console.log("arrayContexts: ",arrayContexts);

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
}

function enfocarAreaTexto() {
  areaTextoRef.value.focus();
}

const mensaje = ref('');
const mensajes = ref([]);

// Agregar nueva referencia para el contenedor del chat
const contenedorChatRef = ref(null);
const usuarioHizoScroll = ref(false);

// Configurar marked (opcional)
marked.setOptions({
  breaks: true, // Convertir saltos de línea en <br>
  gfm: true, // Habilitar GitHub Flavored Markdown
});

// Función para convertir markdown a HTML seguro
function renderMarkdown(content) {
  return DOMPurify.sanitize(marked.parse(content));
}

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

// Función para hacer scroll al final
/* function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (contenedorChatRef.value) {
        contenedorChatRef.value.scrollTo({
          top: contenedorChatRef.value.scrollHeight,
          //behavior: 'smooth'
          behavior: 'auto'
        });
      }
    }, 50);
  });
} */

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

const submitMensaje = async () => {
  if (isSubmitting.value || mensaje.value.trim() === '') return;

  const resultado = ref('');
  const loading = ref(false);

  /* if (mensaje.value === "") return; */

  isSubmitting.value = true;

  const body = {
    user_id: 'c5461377-f021-402a-9700-a6d43c82e30c',
    //type: "Preguntar",
    type: 'RAG',
    //context_id: parseInt(contextId),
    context_id: contextID.value,
    //context_id: 9,
    model: 'deepseek-r1',
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

  // Hacer scroll inicial al nuevo mensaje
  //scrollToBottom();

  // Envía la pregunta
  const res = await fetch(`${config.public.iaBackendUrl}queue/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    const streamRes = await fetch(`${config.public.iaBackendUrl}queue/stream/${jobId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
                //scrollToBottom();
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
    //scrollToBottom();
    scrollToBottomIfNeeded();
  } finally {
    isSubmitting.value = false;
  }
};

const generaIdAleatorio = (el) => {
  return el + Math.random().toString(36).substring(2);
};
const idAleatorio = generaIdAleatorio('areatexto-');
const idAleatorioCD = generaIdAleatorio('controldeslizante-');
</script>

<template>
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
                    <div
                      class="m-0 markdown-content"
                      :class="
                        m.actor == 'Humano' ? 'fondo-color-neutro p-2 borde-redondeado-20' : ''
                      "
                      :style="m.actor == 'Humano' ? 'max-width: 592px' : ''"
                      v-html="renderMarkdown(m.message)"
                    ></div>

                    <!-- Reporte -->
                    <div v-if="m.actor == 'AI' && m.reporte" class="">
                      <p>
                        ¿Te gustaría que genere un reporte con esta información o prefieres seguir
                        consultando?
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

          <div class="contenedor-area-texto">
            <form class="formulario-area-texto">
              <label :for="idAleatorio" class="a11y-solo-lectura"> Nombre de la etiqueta </label>
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
          </div>
        </div>
      </div>
    </div>

    <div class="columna-2" />
  </div>
  <!-- Modal reporte -->
  <ClientOnly>
    <SisdaiModal ref="reporteModal">
      <template #encabezado>
        <h2>
          {{ controlDeslizante?.valor_seleccionado < 100 ? 'Creando reporte' : 'Reporte listo' }}
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
                @update:val_entrada="($event) => (controlDeslizante.valor_seleccionado = $event)"
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

<style lang="scss">
.contenedor-chat {
  height: 85vh;
  .contenedor-chat-contenido {
    height: 100%;
    position: relative;
    .contenedor-log {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: calc(100% - 120px - 48px);
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
</style>
