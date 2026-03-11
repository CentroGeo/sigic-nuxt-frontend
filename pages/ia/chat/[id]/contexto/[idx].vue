<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import DOMPurify from 'dompurify'; // Para seguridad XSS
import { marked } from 'marked'; // Importar marked para mostrar formato markdown

import { SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import SisdaiCapaVectorial from '@centrogeomx/sisdai-mapas/src/componentes/capa/vectorial/SisdaiCapaVectorial.vue';
import GloboInformativo from '@centrogeomx/sisdai-mapas/src/componentes/mapa/elementos/info/GloboInformativo.vue';

const { data, refresh } = useAuth();
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

const modalReporteInfo = ref(null);
const modalReporteInstrucciones = ref(null);
const modalEspacializarInstrucciones = ref(null);
const isSubmitting = ref(false);

const chatId = computed(() => parseInt(route.params.id) || 0);
const contextID = computed(() => parseInt(route.params.idx));
const chatID = ref(0);

const modalPreviewReporte = ref(null);
const previewReporte = ref(null);

const modalPreviewEspacializacion = ref(null);
const previewEspacializacionData = ref(null);
const previewGeojsonUrl = ref(null);

const idAleatorio = () => {
  return 'areatexto-' + Math.random().toString(36).substring(2);
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
  // volviendo reactivo el chat id del route params
  chatID.value = chatId.value;
  if (chatID.value > 0) {
    // console.log('chat existente');
    loadExistentChat(chatID.value);
  }
} else {
  console.warn('Chat no válido');
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

// const arrayChats = ref([]);
// Función para consultar lista de chats
const loadChatsList = async () => {
  let arrayChats = [];

  // Consulta proyectos
  arrayChats = await storeIA.getChatList();
  // console.log('arrayChats', arrayChats);

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
    type: 'RAG',
    context_id: contextID.value,
    // model: 'deepseek-r1',
    // model: 'qwen2:1.5b',
    // model: "llama3.1",
    model: config.public.ollamaModel,
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
            console.error('Error Leyendo status: ' + err);
            console.error(resultElement);
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
              console.error('Error Leyendo data: ' + err);
              console.error(resultElement);
            }
          }
        }
      });
    }
  } catch (err) {
    //resultado.value = 'Error en el streaming: ' + err
    //mensajes.value[aiMessageIndex].message = 'Error en el streaming: ' + err
    console.error('Error en el streaming: ' + err);
    console.error(mensajeRespuesta);

    scrollToBottomIfNeeded();
  } finally {
    isSubmitting.value = false;

    storeIA.triggerChatsReload();
  }
};

watch(seleccionProyecto, (nv) => {
  loadContexts(nv);
});

watch(
  () => storeIA.chatsVersion,
  () => {
    loadChatsList();
  }
);

onMounted(() => {
  // Recuperando la lista de chats
  loadChatsList();

  // Recuperando la lista de proyectos
  loadProjectList();
});
//
const archivosEliminados = ref([]);
const fuentesSeleccionadas = ref([]);
// Manejar selección/deselección de fuentes
const toggleSeleccionFuente = (fuente) => {
  const index = fuentesSeleccionadas.value.findIndex((f) => f.id === fuente.id);
  if (index === -1) {
    fuentesSeleccionadas.value.push(fuente);
    const eliminadoIndex = archivosEliminados.value.indexOf(fuente.id);
    if (eliminadoIndex !== -1) {
      archivosEliminados.value.splice(eliminadoIndex, 1);
    }
  } else {
    fuentesSeleccionadas.value.splice(index, 1);
    if (!archivosEliminados.value.includes(fuente.id)) {
      archivosEliminados.value.push(fuente.id);
    }
  }
};

const arrayContextSources = ref([]);

// Función para cargar las fuentes del contexto
const loadSources = async () => {
  // console.log('loadSources');
  let contextById = {};
  contextById = await storeIA.getContextById(contextID.value);
  arrayContextSources.value = contextById.files;
};

const tituloReporteModal = ref('');
const campoNombreVisible = ref(false);
const leyendaRadioGrupoReporteModal = ref('');
async function abrirModalReporteInfo(modo) {
  // console.log('reporte modal info');
  if (modo === 'reporte') {
    tituloReporteModal.value = 'Generar reporte';
    campoNombreVisible.value = true;
    leyendaRadioGrupoReporteModal.value = 'Fuentes de información';
  } else {
    if (modo === 'espacializar') {
      tituloReporteModal.value = 'Espacializar información';
      campoNombreVisible.value = false;
      leyendaRadioGrupoReporteModal.value =
        'Selecciona los documentos o tabulados que quieras espacializar';
    }
  }
  modalReporteInfo.value.abrirModal();
  // Recupera las fuentes del contexto
  await loadSources();
}

const campoNombreReporte = ref();
const botonRadioReporte = ref('Uno');

function cancelarReporte() {
  modalReporteInfo.value.cerrarModal();
  campoNombreReporte.value = '';
  botonRadioReporte.value = 'Uno';
  fuentesSeleccionadas.value = [];
}

const botonGenerarReporte = ref('');
function abrirModalInstrucciones() {
  modalReporteInfo.value.cerrarModal();
  if (tituloReporteModal.value === 'Generar reporte') {
    botonGenerarReporte.value = 'Generar reporte';
    modalReporteInstrucciones.value.abrirModal();
  } else {
    if (tituloReporteModal.value === 'Espacializar información') {
      botonGenerarReporte.value = 'Espacializar';
      modalEspacializarInstrucciones.value.abrirModal();
    }
  }

  if (botonRadioReporte.value === 'Uno') {
    // seleccionando todas las fuentes del contexto
    arrayContextSources.value.forEach((d) => toggleSeleccionFuente(d));
  }
  // console.log('campoNombreReporte.value', campoNombreReporte.value);
  // console.log('fuentesSeleccionadas.value', fuentesSeleccionadas.value);
}

// Función para determinar el tipo de archivo
const obtenerTipoArchivo = (nombre) => {
  const extension = nombre.split('.').pop().toLowerCase();
  const tipos = {
    shp: 'Shapefile',
    geojson: 'GeoJSON',
    csv: 'CSV',
    kml: 'KML',
    zip: 'ZIP',
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
  };
  return tipos[extension] || extension.toUpperCase();
};

const areaReporteInstrucciones = ref('');
const seleccionTipoReporte = ref('');
const seleccionTipoArchivo = ref('');
const botonRadioHojaMembretada = ref(false);
const casillaArregloUbicaciones = ref([]);
const botonRadioRepresentacion = ref('centroide');
const botonRadioUbicacion = ref('resolver_auto');
const botonRadioFormato = ref('capa_visualizador');

// --- Nueva Lógica de Integración para Reportes y Espacialización ---
const reportesGenerados = ref([]); // Lista reactiva de reportes en sesión actual
const isEspacializando = ref(false); // Estado de carga para el modal de espacializar

const pollStatus = async (itemId, type = 'reporte') => {
  const endpoint =
    type === 'espacializacion' ? `/api/localidades/${itemId}/` : `/api/reports/${itemId}/`;

  let failedAttempts = 0; // Circuito preventivo para loops infinitos

  const interval = setInterval(async () => {
    const token = data.value?.accessToken;
    if (!token) return;

    try {
      const res = await fetch(`${config.public.iaBackendUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        failedAttempts = 0; // Reiniciamos contador si responde bien
        const reportData = await res.json();

        // Find and update the local report tracking object
        const idx = reportesGenerados.value.findIndex((r) => r.id === itemId);
        if (idx !== -1) {
          reportesGenerados.value[idx] = { ...reportesGenerados.value[idx], ...reportData };

          if (reportData.status === 'done' || reportData.status === 'error') {
            if (reportData.status === 'done' && type === 'espacializacion') {
              reportesGenerados.value[idx].progress = 100;
            }
            clearInterval(interval);
          }
        } else {
          // Not found in our current session array? stop polling
          clearInterval(interval);
        }
      } else {
        console.error(`pollStatus error - Status: ${res.status}`);
        if (res.status === 401 || res.status === 403) {
          failedAttempts++;
          if (failedAttempts > 3) {
            console.error(
              `Demasiados fallos ${res.status} consecutivos, deteniendo polling para:`,
              itemId
            );
            clearInterval(interval);
            const idx = reportesGenerados.value.findIndex((r) => r.id === itemId);
            if (idx !== -1) reportesGenerados.value[idx].status = 'error';
            return;
          }

          // console.log('Intentando refrescar la sesión local de Nuxt Auth...');
          try {
            await refresh();
            // Optional delay to let reactivity flush
            await new Promise((r) => setTimeout(r, 500));
            // console.log(
            //   'Token local refrescado a:',
            //   data.value?.accessToken?.substring(0, 15) + '...'
            // );
          } catch (refreshErr) {
            console.error('Fallo al refrescar token local:', refreshErr);
          }
        }
      }
    } catch (err) {
      console.error(`Error polling status for ${type} ${itemId}:`, err);
    }
  }, 10000); // Poll every 10 seconds
};

// Fetch initial reports for this context when the component mounts
const fetchInitialReports = async () => {
  if (!contextID.value || !data.value?.accessToken) return;

  try {
    const resReports = await fetch(
      `${config.public.iaBackendUrl}/api/reports/?context_id=${contextID.value}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.value.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const resSpatial = await fetch(
      `${config.public.iaBackendUrl}/api/localidades/?context_id=${contextID.value}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.value.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let combined = [];

    if (resReports.ok) {
      const reports = await resReports.json();
      combined = combined.concat(
        reports.map((r) => ({
          ...r,
          type: 'reporte',
        }))
      );
    }

    if (resSpatial.ok) {
      const spatial = await resSpatial.json();
      combined = combined.concat(
        spatial.map((s) => ({
          ...s,
          file_format: s.export_format,
          type: 'espacializacion',
          progress: s.progress || 0,
        }))
      );
    }

    // Sort by created_date descending if needed
    combined.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    reportesGenerados.value = combined;

    // Resume polling for any report/spatialization that's still pending/processing
    reportesGenerados.value.forEach((item) => {
      if (item.status === 'pending' || item.status === 'processing') {
        pollStatus(item.id, item.type);
      }
    });
  } catch (err) {
    console.error('Error fetching initial reports:', err);
  }
};

onMounted(() => {
  fetchInitialReports();
});

async function generarReporte(modo) {
  if (modo === 'reporte') {
    const token = data.value?.accessToken;
    const payload = {
      context_id: contextID.value,
      file_ids: fuentesSeleccionadas.value.map((d) => d.id), // Ensure we only send the DB id
      report_name: campoNombreReporte.value,
      report_type: seleccionTipoReporte.value,
      file_format: seleccionTipoArchivo.value,
      instructions: areaReporteInstrucciones.value,
      use_letterhead: botonRadioHojaMembretada.value,
    };

    try {
      const res = await fetch(`${config.public.iaBackendUrl}/api/reports/generate/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 202) {
        const data = await res.json();
        // Add to our reactive list of pending tasks
        reportesGenerados.value.push({
          id: data.report_id,
          task_id: data.task_id,
          status: data.status,
          report_name: payload.report_name,
          file_format: payload.file_format,
        });

        // Start polling for this specific task
        pollStatus(data.report_id);
      } else {
        const errorData = await res.json();
        console.error('Error generando reporte:', errorData);
      }
    } catch (error) {
      console.error('Network error triggering report generation:', error);
    }
  } else if (modo === 'espacializar') {
    isEspacializando.value = true;
    const token = data.value?.accessToken;

    // Traducir parámetros de la UI a los esperados por el Backend
    // Representación: 'centroide' -> 'centroid', 'geometria' -> 'polygon', 'punto' -> 'point'
    const geomMap = {
      centroide: 'centroid',
      geometria: 'polygon',
      punto: 'point',
    };
    const geometryType = geomMap[botonRadioRepresentacion.value] || 'point';

    // Ubicación: 'resolver_auto' -> 'auto', 'marcar_manual' -> 'México' (por defecto)
    const focusValue = botonRadioUbicacion.value === 'resolver_auto' ? 'auto' : 'México';

    // Formato de exportación: 'descargar_geojson' -> 'geojson', 'descargar_shp' -> 'shp'
    let exportFormat = 'geojson';
    if (botonRadioFormato.value === 'descargar_shp') exportFormat = 'shp';
    if (botonRadioFormato.value === 'descargar_gpkg') exportFormat = 'gpkg';

    const reportName =
      fuentesSeleccionadas.value.length > 1
        ? 'Mapa espacializado de varias fuentes'
        : `Mapa espacializado: ${fuentesSeleccionadas.value[0]?.filename}`;
    const selectedIds = fuentesSeleccionadas.value.map((d) => d.id);

    // Crear un ID temporal para la tarjeta visual
    const tempId = `esp-${Date.now()}`;

    // Inyectar a la lista del sidebar
    reportesGenerados.value.push({
      id: tempId,
      type: 'espacializacion',
      status: 'processing',
      report_name: reportName,
      file_format: exportFormat,
      progress: 0,
    });

    // Cerrar el modal inmediatamente para no bloquear la UI
    modalEspacializarInstrucciones.value.cerrarModal();
    fuentesSeleccionadas.value = [];

    const payload = {
      context_id: contextID.value,
      file_ids: selectedIds,
      report_name: reportName,
      entity_types:
        casillaArregloUbicaciones.value.length > 0 ? casillaArregloUbicaciones.value : undefined,
      geometry_type: geometryType,
      focus: focusValue,
      export_format: exportFormat,
      refresh_token: data.value?.refreshToken,
    };

    try {
      const res = await fetch(`${config.public.iaBackendUrl}/api/localidades/detect/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        const elementIndex = reportesGenerados.value.findIndex((r) => r.id === tempId);

        if (elementIndex !== -1) {
          // Reemplazamos tempId por el id real de base de datos e iniciamos polling
          reportesGenerados.value[elementIndex].id = responseData.id;
          reportesGenerados.value[elementIndex].status = responseData.status || 'processing';
          pollStatus(responseData.id, 'espacializacion');
        }
      } else {
        const errorData = await res.json();
        console.error('Error enviando ubicaciones:', errorData);
        const elementIndex = reportesGenerados.value.findIndex((r) => r.id === tempId);
        if (elementIndex !== -1) reportesGenerados.value[elementIndex].status = 'error';
      }
    } catch (error) {
      console.error('Error de red al intentar espacializar:', error);
      const elementIndex = reportesGenerados.value.findIndex((r) => r.id === tempId);
      if (elementIndex !== -1) reportesGenerados.value[elementIndex].status = 'error';
    } finally {
      isEspacializando.value = false;
    }
    return; // Early return para no ejecutar el cleanup normal de generacion de reportes asíncronos
  }

  fuentesSeleccionadas.value = [];
  modalReporteInstrucciones.value.cerrarModal();
}

function abrirPreviewReporte(reporte) {
  previewReporte.value = reporte;
  modalPreviewReporte.value?.abrirModal();
}

function cerrarPreviewReporte() {
  modalPreviewReporte.value?.cerrarModal();
  previewReporte.value = null;
}

async function abrirPreviewEspacializacion(reporte) {
  previewEspacializacionData.value = reporte;
  previewGeojsonUrl.value = reporte.download_url;
  modalPreviewEspacializacion.value?.abrirModal();
}

function cerrarPreviewEspacializacion() {
  modalPreviewEspacializacion.value?.cerrarModal();
  previewEspacializacionData.value = null;
  previewGeojsonUrl.value = null;
}

const opTipoArchivo = ref({ pdf: 'PDF', word: 'WORD', pptx: 'PPTX', csv: 'CSV' });
watch(seleccionTipoReporte, (nv) => {
  if (nv === 'presentation') {
    seleccionTipoArchivo.value = 'pptx';
    opTipoArchivo.value = { pptx: 'PPTX' };
    botonRadioHojaMembretada.value = false;
  } else {
    opTipoArchivo.value = { pdf: 'PDF', word: 'WORD', pptx: 'PPTX', csv: 'CSV' };
  }
});
watch(seleccionTipoArchivo, (nv) => {
  if (!['pdf', 'word'].includes(nv)) {
    botonRadioHojaMembretada.value = false;
  }
});
</script>

<template>
  <IaLayoutPaneles>
    <template #catalogo>
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
    </template>

    <template #visualizador>
      <main id="principal">
        <div class="grid">
          <div class="columna-1" />

          <div class="columna-14">
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
                          <!-- Mensaje chat con markdown -->
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

                          <!-- <div v-if="m.actor == 'AI' && m.reporte" class="">
                            <p>
                              ¿Te gustaría que genere un reporte con esta información o prefieres
                              seguir consultando?
                            </p>
                            <div class="flex">
                              <button
                                class="boton-primario boton-chico"
                                aria-label="Generar reporte"
                                type="button"
                                @click="modalReporteInfo?.abrirModal()"
                              >
                                Generar reporte
                                <span class="pictograma-reporte" aria-hidden="true" />
                              </button>
                              
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
                          </div> -->
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

          <div class="columna-1" />
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

        <SisdaiModal ref="modalReporteInfo" class="modal-grande">
          <template #encabezado>
            <h2>{{ tituloReporteModal }}</h2>
          </template>

          <template #cuerpo>
            <div>
              <ClientOnly>
                <SisdaiCampoBase
                  v-if="campoNombreVisible"
                  v-model="campoNombreReporte"
                  etiqueta="Nombre del reporte"
                  ejemplo="Ej. Diagnóstico territorial del monitoreo marino en el Caribe mexicano"
                  :es_obligatorio="true"
                  :es_etiqueta_visible="true"
                />
                <SisdaiBotonesRadioGrupo
                  :leyenda="leyendaRadioGrupoReporteModal"
                  :es_vertical="true"
                  :es_obligatorio="true"
                >
                  <SisdaiBotonRadio
                    v-model="botonRadioReporte"
                    etiqueta="Usar todas las fuentes disponibles en el contexto"
                    value="Uno"
                    name="fuentesdeinformacion"
                    :es_obligatorio="true"
                  />
                  <SisdaiBotonRadio
                    v-model="botonRadioReporte"
                    etiqueta="Seleccionar fuentes del contexto"
                    value="Dos"
                    name="fuentesdeinformacion"
                    :es_obligatorio="true"
                  />
                </SisdaiBotonesRadioGrupo>
              </ClientOnly>
            </div>
            <div
              v-if="botonRadioReporte === 'Dos' && arrayContextSources.length > 0"
              class="tabla-archivos m-y-3"
            >
              <table class="tabla">
                <thead>
                  <tr>
                    <th class="checkbox-header p-x-3 p-y-2">Selección</th>
                    <th class="p-x-3 p-y-2">Nombre</th>
                    <th class="p-x-3 p-y-2">Tipo</th>
                    <th class="p-x-3 p-y-2">Categoría</th>
                    <th class="p-x-3 p-y-2">Origen</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="fuente in arrayContextSources" :key="`fila-fuentes-${fuente.id}`">
                    <td class="checkbox-cell p-3">
                      <label :for="`checkboxfuente${fuente.id}`" class="checkbox-wrapper">
                        <input
                          :id="`checkboxfuente${fuente.id}`"
                          type="checkbox"
                          :checked="fuentesSeleccionadas.some((f) => f.id === fuente.id)"
                          @change="toggleSeleccionFuente(fuente)"
                        />
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td class="p-3">{{ fuente.filename }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">
                        {{ obtenerTipoArchivo(fuente.filename) }}
                      </span>
                    </td>
                    <td class="p-3 flex flex-contenido-centrado">
                      <p
                        class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                        style="width: max-content"
                      >
                        <span v-if="fuente.document_type === 'application/pdf'">
                          <span class="pictograma-documento" />
                          Documentos
                        </span>
                        <span v-if="fuente.document_type === 'text/csv'">
                          <span class="pictograma-tabla" />
                          Datos tabulados
                        </span>
                      </p>
                    </td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo"> Catálogo </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template #pie>
            <button
              class="boton-primario boton-chico"
              aria-label="Ir a llenar instrucciones"
              type="button"
              :disabled="
                (campoNombreVisible && !campoNombreReporte) ||
                (botonRadioReporte === 'Dos' && fuentesSeleccionadas.length === 0)
              "
              @click="abrirModalInstrucciones"
            >
              Siguiente
            </button>
            <button
              class="boton-secundario boton-chico"
              aria-label="Cancelar generar reporte"
              type="button"
              @click="cancelarReporte"
            >
              Cancelar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalReporteInstrucciones">
          <template #encabezado>
            <h2>Generar reporte</h2>
          </template>

          <template #cuerpo>
            <ClientOnly>
              <SisdaiAreaTexto
                v-model="areaReporteInstrucciones"
                etiqueta="Instrucciones para el reporte"
                ejemplo="Ej. Genera un reporte que explique los principales retros del monitoreo marino, considerando la cobertura espacial y la integración de datos, con un lenguaje claro para tomadores de decisión."
                :es_obligatorio="true"
                :es_etiqueta_visible="true"
              />
              <SisdaiSelector
                v-model="seleccionTipoReporte"
                etiqueta="Tipo de reporte"
                :es_obligatorio="true"
              >
                <option value="institutional">Institucional</option>
                <option value="descriptive">Descriptivo</option>
                <option value="summary">Resumen</option>
                <option value="presentation">Presentación</option>
                <option value="evaluation">Evaluación</option>
              </SisdaiSelector>

              <SisdaiSelector
                v-model="seleccionTipoArchivo"
                etiqueta="Tipo de archivo"
                :es_obligatorio="true"
              >
                <option
                  v-for="(value, key, idx) in opTipoArchivo"
                  :key="`optipoarchivo-${idx}`"
                  :value="key"
                >
                  {{ value }}
                </option>
              </SisdaiSelector>

              <SisdaiBotonesRadioGrupo
                v-show="['pdf', 'word'].includes(seleccionTipoArchivo)"
                leyenda="Hoja membretada (Formato SECIHTI)"
                :es_vertical="false"
              >
                <SisdaiBotonRadio
                  v-model="botonRadioHojaMembretada"
                  etiqueta="Sí"
                  :value="true"
                  name="hojamembretada"
                  :es_obligatorio="true"
                />
                <SisdaiBotonRadio
                  v-model="botonRadioHojaMembretada"
                  etiqueta="No"
                  :value="false"
                  name="hojamembretada"
                  :es_obligatorio="true"
                />
              </SisdaiBotonesRadioGrupo>
            </ClientOnly>
          </template>

          <template #pie>
            <button
              class="boton-primario boton-chico"
              aria-label="Generar reporte"
              type="button"
              :disabled="
                !areaReporteInstrucciones || !seleccionTipoReporte || !seleccionTipoArchivo
              "
              @click="generarReporte('reporte')"
            >
              {{ botonGenerarReporte }}
            </button>
            <button
              class="boton-secundario boton-chico"
              aria-label="Regresar a llenar información"
              type="button"
              :disabled="false"
              @click="
                modalReporteInstrucciones.cerrarModal();
                modalReporteInfo.abrirModal();
              "
            >
              Regresar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalEspacializarInstrucciones" class="modal-grande">
          <template #encabezado>
            <h2>Espacializar información</h2>
          </template>

          <template #cuerpo>
            <p>
              Ahora, define cómo la IA debe identificar y representar las ubicaciones detectadas.
            </p>
            <div class="flex">
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8 p-x-2 p-y-1">
                  <div class="tarjeta-modal-espacializar">
                    <ClientOnly>
                      <form @submit.prevent>
                        <fieldset class="grupo-formulario grupo-formulario-vertical">
                          <legend>1. Selecciona los tipos de ubicaciones a identificar</legend>

                          <div class="flex">
                            <div class="columna-8">
                              <div class="grupo-formulario grupo-formulario-vertical">
                                <span>
                                  <input
                                    id="casilla-identificadorgrupaluno"
                                    v-model="casillaArregloUbicaciones"
                                    type="checkbox"
                                    value="paises"
                                    :required="!casillaArregloUbicaciones.length"
                                  />
                                  <label for="casilla-identificadorgrupaluno"> Países </label>
                                </span>
                                <span>
                                  <input
                                    id="casilla-identificadorgrupaldos"
                                    v-model="casillaArregloUbicaciones"
                                    type="checkbox"
                                    value="estados"
                                    :required="!casillaArregloUbicaciones.length"
                                  />
                                  <label for="casilla-identificadorgrupaldos"> Estados </label>
                                </span>
                                <span>
                                  <input
                                    id="casilla-identificadorgrupaltre"
                                    v-model="casillaArregloUbicaciones"
                                    type="checkbox"
                                    value="municipios"
                                    :required="!casillaArregloUbicaciones.length"
                                  />
                                  <label for="casilla-identificadorgrupaltre"> Municipios </label>
                                </span>
                              </div>
                            </div>
                            <div class="columna-8">
                              <div class="grupo-formulario grupo-formulario-vertical">
                                <span>
                                  <input
                                    id="casilla-identificadorgrupalcuatro"
                                    v-model="casillaArregloUbicaciones"
                                    type="checkbox"
                                    value="localidades"
                                    :required="!casillaArregloUbicaciones.length"
                                  />
                                  <label for="casilla-identificadorgrupalcuatro">
                                    Localidades
                                  </label>
                                </span>
                                <span>
                                  <input
                                    id="casilla-identificadorgrupalcinco"
                                    v-model="casillaArregloUbicaciones"
                                    type="checkbox"
                                    value="infraestructura"
                                    :required="!casillaArregloUbicaciones.length"
                                  />
                                  <label for="casilla-identificadorgrupalcinco">
                                    Infraestructura
                                  </label>
                                </span>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                        <p aria-live="polite" class="formulario-ayuda" role="status"></p>
                      </form>
                    </ClientOnly>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8 p-x-2 p-y-1">
                  <div class="tarjeta-modal-espacializar">
                    <ClientOnly>
                      <SisdaiBotonesRadioGrupo
                        leyenda="2. Define cómo se mostrarán las ubicaciones detectadas"
                        es_vertical
                      >
                        <SisdaiBotonRadio
                          v-model="botonRadioRepresentacion"
                          etiqueta="Centroide"
                          value="centroide"
                          name="representacion"
                          :es_obligatorio="true"
                        />
                        <SisdaiBotonRadio
                          v-model="botonRadioRepresentacion"
                          etiqueta="Geometría completa"
                          value="geometria"
                          name="representacion"
                          :es_obligatorio="true"
                        />
                        <SisdaiBotonRadio
                          v-model="botonRadioRepresentacion"
                          etiqueta="Punto con nivel de confianza"
                          value="punto"
                          name="representacion"
                          :es_obligatorio="true"
                        />
                      </SisdaiBotonesRadioGrupo>
                    </ClientOnly>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8 p-x-2 p-y-1">
                  <div class="tarjeta-modal-espacializar">
                    <ClientOnly>
                      <SisdaiBotonesRadioGrupo
                        leyenda="3. Define qué debe hacer la IA cuando la ubicación no sea clara"
                        es_vertical
                      >
                        <SisdaiBotonRadio
                          v-model="botonRadioUbicacion"
                          etiqueta="Resolver automáticamente"
                          value="resolver_auto"
                          name="ubicacion"
                          :es_obligatorio="true"
                        />
                        <SisdaiBotonRadio
                          v-model="botonRadioUbicacion"
                          etiqueta="Marcar para revisión manual"
                          value="marcar_manual"
                          name="ubicacion"
                          :es_obligatorio="true"
                        />
                      </SisdaiBotonesRadioGrupo>
                    </ClientOnly>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8 p-x-2 p-y-1">
                  <div class="tarjeta-modal-espacializar">
                    <ClientOnly>
                      <SisdaiBotonesRadioGrupo
                        leyenda="4. Selecciona el formato de salida"
                        es_vertical
                      >
                        <SisdaiBotonRadio
                          v-model="botonRadioFormato"
                          etiqueta="Mostrar como capa en el visualizador"
                          value="capa_visualizador"
                          name="formatosalida"
                          :es_obligatorio="true"
                        />
                        <SisdaiBotonRadio
                          v-model="botonRadioFormato"
                          etiqueta="Guardar como capa en el catálogo"
                          value="capa_catalogo"
                          name="formatosalida"
                          :es_obligatorio="true"
                        />
                        <SisdaiBotonRadio
                          v-model="botonRadioFormato"
                          etiqueta="Descargar como archivo GeoJSON"
                          value="descargar_geojson"
                          name="formatosalida"
                          :es_obligatorio="true"
                        />
                      </SisdaiBotonesRadioGrupo>
                    </ClientOnly>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #pie>
            <button
              class="boton-primario boton-chico"
              aria-label="Generar reporte"
              type="button"
              :disabled="!casillaArregloUbicaciones.length"
              @click="generarReporte('espacializar')"
            >
              {{ botonGenerarReporte }}
            </button>
            <button
              class="boton-secundario boton-chico"
              aria-label="Regresar a llenar información"
              type="button"
              :disabled="isEspacializando"
              @click="
                modalEspacializarInstrucciones.cerrarModal();
                modalReporteInfo.abrirModal();
              "
            >
              Regresar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalPreviewReporte" class="modal-grande">
          <template #encabezado>
            <h2>Reporte</h2>
          </template>

          <template #cuerpo>
            <div v-if="previewReporte" class="m-y-2" style="width: 100%; height: 60vh">
              <!-- El iframe renderizará nativamente PDFs y TXT que el navegador soporte -->
              <iframe
                v-if="['pdf', 'txt'].includes(previewReporte.file_format)"
                :src="previewReporte.download_url"
                style="width: 100%; height: 100%; border: none; border-radius: 8px"
                title="Previsualización del reporte"
              >
              </iframe>
              <div
                v-else
                class="flex flex-contenido-centrado flex-vertical-centrado fondo-color-neutro borde-redondeado-8"
                style="height: 100%; flex-direction: column"
              >
                <span
                  class="pictograma-archivo-descargar texto-color-acento"
                  style="font-size: 4rem"
                ></span>
                <p class="m-t-3 texto-centrado">
                  <strong>Formato no compatible para previsualización.</strong><br />
                  Los documentos en formato PowerPoint y Word no se pueden mostrar visualmente
                  dentro del navegador.<br />
                  Por favor, descárgalo para revisarlo en tu equipo.
                </p>
              </div>
            </div>
          </template>

          <template #pie>
            <button
              class="boton-secundario boton-chico"
              aria-label="Cerrar modal"
              type="button"
              @click="cerrarPreviewReporte"
            >
              Cerrar
            </button>
            <a
              :href="previewReporte?.download_url"
              target="_blank"
              class="boton-primario boton-chico m-l-2"
              style="text-decoration: none"
            >
              Descargar
            </a>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalPreviewEspacializacion" class="modal-grande modal-espacializacion">
          <template #encabezado>
            <div style="padding: 0 24px">
              <h4 class="m-0">
                {{ previewEspacializacionData?.report_name || 'Mapa espacializado' }}
              </h4>

              <div class="mensaje-ia" role="note">
                <span class="pictograma-informacion" aria-hidden="true"></span>
                <p>
                  Este resultado es generado mediante herramientas de IA y puede contener
                  imprecisiones; se recomienda su revisión y validación.
                </p>
              </div>
            </div>
          </template>

          <template #cuerpo>
            <div
              v-if="previewGeojsonUrl"
              class="posicion-relativa"
              style="
                width: 100%;
                height: 50vh;
                min-height: 350px;
                border-top: 1px solid #d7dce2;
                border-bottom: 1px solid #d7dce2;
                border-radius: 0;
                overflow: hidden;
              "
            >
              <!-- Mapa -->
              <SisdaiMapa class="gema" :vista="{ centro: [-102.5, 23.6], zoom: 4.5 }">
                <!-- Base grisácea clara -->
                <SisdaiCapaXyz
                  id="capa-base"
                  url="https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <!-- Vector sobrepuesto -->
                <SisdaiCapaVectorial
                  id="capa-preview-ia"
                  :fuente="previewGeojsonUrl"
                  :globo-informativo="
                    (d) =>
                      `<p><b>Info</b><br /><b>Nombre:</b> ${d['name'] || 'S/N'}<br /><b>Tipo:</b> ${d['type'] || 'S/T'}<br /><b>Contexto:</b> ${d['context'] || 'S/C'}</p>`
                  "
                />

                <!-- Globo Informativo (Tooltips en Hover) -->
                <GloboInformativo />
              </SisdaiMapa>

              <!-- Leyenda superpuesta -->
              <div
                class="posicion-absoluta fondo-color-neutro p-3 borde-redondeado-8 sombra-1"
                style="bottom: 16px; left: 16px; z-index: 10"
              >
                <p class="m-0 m-b-2" style="font-weight: 600; font-size: 14px">Leyenda</p>
                <div class="flex flex-vertical-centrado m-b-1">
                  <div
                    style="
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background-color: #a9435b;
                      border: 1px solid white;
                    "
                    class="m-r-1"
                  ></div>
                  <span style="font-size: 12px">Ubicaciones detectadas</span>
                </div>
                <div class="flex flex-vertical-centrado">
                  <div
                    style="
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background-color: #cccccc;
                      border: 1px solid white;
                    "
                    class="m-r-1"
                  ></div>
                  <span style="font-size: 12px">Baja confianza</span>
                </div>
              </div>
            </div>

            <div
              v-if="!previewGeojsonUrl"
              class="flex flex-contenido-centrado flex-vertical-centrado fondo-color-neutro borde-redondeado-8 p-3 m-y-2"
              style="height: 50vh; min-height: 350px"
            >
              <span class="pictograma-alerta texto-color-error" style="font-size: 4rem"></span>
              <p class="m-t-3 texto-centrado">
                Error al intentar cargar el archivo de espacialización geográfico o archivo
                inexistente/inválido.
              </p>
            </div>
          </template>

          <template #pie>
            <a
              :href="previewEspacializacionData?.download_url"
              target="_blank"
              class="boton-primario boton-chico"
              style="text-decoration: none"
            >
              <span class="pictograma-archivo-descargar m-r-1" aria-hidden="true" /> Descargar
            </a>
            <button
              class="boton-secundario boton-chico m-l-2"
              aria-label="Cerrar modal"
              type="button"
              @click="cerrarPreviewEspacializacion"
            >
              Cerrar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>

    <template #seleccion>
      <div class="overflowYAuto">
        <div class="positionSticky">
          <div class="fondo-color-acento p-x-3 p-y-1">
            <h5>Herramientas de IA</h5>
          </div>

          <div class="m-3">
            <div class="flex">
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8">
                  <div class="flex p-2" style="row-gap: 8px">
                    <div class="columna-16">
                      <span class="pictograma-reporte texto-color-acento"></span>
                    </div>
                    <div class="columna-16">
                      <div class="flex flex-contenido-separado">
                        <div class="columna-8 flex-vertical-final">
                          <p class="m-0">Generar reporte</p>
                        </div>
                        <div class="flex-vertical-final">
                          <button
                            class="boton-pictograma boton-con-contenedor-secundario boton-grande"
                            aria-label="Generar reporte"
                            type="button"
                            @click="abrirModalReporteInfo('reporte')"
                          >
                            <span class="pictograma-ia" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8">
                  <div class="flex p-2" style="row-gap: 8px">
                    <div class="columna-16">
                      <span class="pictograma-mapa-generador texto-color-acento"></span>
                    </div>
                    <div class="columna-16">
                      <div class="flex flex-contenido-separado">
                        <div class="columna-8 flex-vertical-final">
                          <p class="m-0">Espacializar información</p>
                        </div>
                        <div class="flex-vertical-final">
                          <button
                            class="boton-pictograma boton-con-contenedor-secundario boton-grande"
                            aria-label="Espacializar información"
                            type="button"
                            @click="abrirModalReporteInfo('espacializar')"
                          >
                            <span class="pictograma-ia" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8">
                  <div class="flex p-2" style="row-gap: 8px">
                    <div class="columna-16">
                      <span class="pictograma-estrella texto-color-acento"></span>
                    </div>
                    <div class="columna-16">
                      <div class="flex flex-contenido-separado">
                        <div class="columna-8 flex-vertical-final">
                          <p class="m-0">Herramienta</p>
                        </div>
                        <div class="flex-vertical-final">
                          <button
                            class="boton-pictograma boton-con-contenedor-secundario boton-grande"
                            aria-label="Acción a realizar"
                            type="button"
                          >
                            <span class="pictograma-ia" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="columna-8">
                <div class="fondo-color-neutro borde-redondeado-8">
                  <div class="flex p-2" style="row-gap: 8px">
                    <div class="columna-16">
                      <span class="pictograma-estrella texto-color-acento"></span>
                    </div>
                    <div class="columna-16">
                      <div class="flex flex-contenido-separado">
                        <div class="columna-8 flex-vertical-final">
                          <p class="m-0">Herramienta</p>
                        </div>
                        <div class="flex-vertical-final">
                          <button
                            class="boton-pictograma boton-con-contenedor-secundario boton-grande"
                            aria-label="Acción a realizar"
                            type="button"
                          >
                            <span class="pictograma-ia" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="m-x-3">
          <div
            v-for="(reporte, index) in reportesGenerados"
            :key="reporte.id || index"
            class="fondo-color-acento borde-redondeado-8 m-b-2"
          >
            <!-- Estado: PROCESANDO o PENDIENTE -->
            <div v-if="reporte.status === 'processing' || reporte.status === 'pending'" class="p-2">
              <div class="flex" :class="{ 'm-b-1': reporte.type === 'espacializacion' }">
                <span
                  class="texto-color-acento flex-vertical-centrado m-r-1"
                  :class="
                    reporte.type === 'espacializacion'
                      ? 'pictograma-mapa-generador'
                      : 'pictograma-actualizar rotar'
                  "
                />
                <p class="flex-vertical-centrado m-0">
                  <template v-if="reporte.type === 'espacializacion'">
                    Espacializando información
                  </template>
                  <template v-else> Generando reporte: {{ reporte.report_name }} </template>
                </p>
              </div>

              <!-- Barra de progreso para espacialización simulada -->
              <div v-if="reporte.type === 'espacializacion'" class="m-t-2">
                <div
                  style="
                    background: rgba(169, 67, 91, 0.2);
                    height: 8px;
                    border-radius: 4px;
                    overflow: hidden;
                    width: 100%;
                  "
                >
                  <div
                    :style="`width: ${Math.round(reporte.progress || 0)}%; background: #A9435B; height: 100%; transition: width 0.5s ease-in-out;`"
                  ></div>
                </div>
                <p
                  class="texto-derecha m-0 m-t-1 texto-color-acento"
                  style="font-size: 11px; font-weight: 500"
                >
                  {{ Math.round(reporte.progress || 0) }}%
                </p>
              </div>
            </div>

            <!-- Estado: COMPLETADO -->
            <div v-else-if="reporte.status === 'done'" class="flex flex-contenido-separado p-2">
              <div
                class="flex cursor-pointer hover-texto-acento"
                style="cursor: pointer"
                @click="
                  reporte.type !== 'espacializacion'
                    ? abrirPreviewReporte(reporte)
                    : abrirPreviewEspacializacion(reporte)
                "
              >
                <span
                  class="texto-color-acento flex-vertical-centrado m-r-1"
                  :class="
                    reporte.type === 'espacializacion'
                      ? 'pictograma-mapa-generador'
                      : 'pictograma-reporte'
                  "
                />
                <p
                  class="flex-vertical-centrado m-0"
                  :style="reporte.type !== 'espacializacion' ? 'text-decoration: underline' : ''"
                >
                  {{ reporte.report_name }}
                </p>
              </div>

              <div>
                <a
                  :href="reporte.download_url"
                  target="_blank"
                  class="boton-pictograma boton-sin-contenedor-secundario"
                  aria-label="Descargar archivo"
                >
                  <span class="pictograma-archivo-descargar" aria-hidden="true" />
                </a>
              </div>
            </div>

            <!-- Estado: ERROR -->
            <div v-else-if="reporte.status === 'error'" class="flex p-2">
              <span class="texto-color-acento flex-vertical-centrado pictograma-cerrar m-r-1" />
              <p class="flex-vertical-centrado m-0">Error procesando: {{ reporte.report_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </IaLayoutPaneles>
</template>

<style scoped>
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.rotar {
  display: inline-flex;
}
.rotar::before {
  display: inline-block;
  animation: spin 2s linear infinite;
  transform-origin: center;
  line-height: inherit;
}
</style>

<style lang="scss" scoped>
fieldset:has([type='checkbox']:required):invalid + .formulario-ayuda::before {
  content: 'Una o más casillas necesitan estar verificadas. ';
}
.tarjeta-modal-espacializar {
  height: 190px;
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Asegúrate de que el input file no se vea cuando no es necesario */
input[type='file'] {
  display: block;
  margin-bottom: 1rem;
}

//tabla de archivos. TODO: estilo sisdai
/* Estilos para la tabla */
/* .tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th, .tabla td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
} */

/* Cabecera del checkbox */
.checkbox-header {
  width: 60px;
  text-align: center;
}

/* Celda del checkbox */
.checkbox-cell {
  vertical-align: middle;
  text-align: center;
  padding: 0 10px;
}

/* Contenedor del checkbox */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

/* Checkbox personalizado */
.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  display: inline-block;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 3px;
  transition: all 0.2s;
}

.checkbox-wrapper:hover input ~ .checkmark {
  background-color: #f1f1f1;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #2196f3;
  border-color: #2196f3;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Fix CSS para el Globo Informativo de Sisdai (Aparecía invisible al estar en el slot) */
:deep(.globo-informacion-capa) {
  position: absolute;
  z-index: 1000;
  display: block;
  visibility: visible;
  pointer-events: none;
}
:deep(.globo-informacion-capa.oculto) {
  visibility: hidden;
}
:deep(.globo-informacion-cuerpo) {
  background: #333333;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  color: white;
  font-size: 12px;
  max-width: 280px;
  white-space: normal;
  overflow-wrap: break-word;
}

/* Permitir que el mapa espacializado ocupe el 100% del ancho del modal sin márgenes */
:deep(.modal-espacializacion .modal-contenedor) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
}
:deep(.modal.modal-espacializacion .modal-cuerpo) {
  padding: 0 !important;
}
:deep(.modal-espacializacion .modal-pie) {
  padding: 0 24px 24px 24px !important;
}

.mensaje-ia {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;

  background-color: #e3ebfb;
  border: 1px solid #1440cc;
  color: #1440cc;
  margin-top: 15px;

  font-size: 14px;
  line-height: 1.3;
}

.mensaje-ia p {
  margin: 0;
}

.mensaje-ia .pictograma-informacion {
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1.2;
}
</style>
