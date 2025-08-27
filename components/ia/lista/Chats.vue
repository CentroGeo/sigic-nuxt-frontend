<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { ref } from 'vue';

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

const fechaHoy = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);

// Función para consultar lista de proyectos
const loadChatsList = async () => {
  let arrayChats = [];

  // Consulta proyectos
  arrayChats = await storeIA.getChatList(1);
  console.log(arrayChats);

  transformarHistorial(arrayChats);
};

function transformarHistorial(historiales) {
  const agrupadoPorFecha = {};

  historiales.forEach((historial) => {
    const fechaISO = historial.credate_date;
    const fecha = new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    historial.context.forEach((contexto) => {
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

function openChat(chat) {
  //console.log("openChat: ",chat)
  return {
    path: '/ia/chat/dinamica',
    query: {
      chat_id: chat.id,
      context_id: chat.id_contexto,
    },
  };
}

onMounted(() => {
  loadChatsList();
});
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
                  <nuxt-link
                    class="tarjeta-chat p-3 borde borde-redondeado-20"
                    :to="openChat(chat)"
                  >
                    <div>
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
                          >
                            <span class="pictograma-editar" aria-hidden="true" />
                          </button>
                          <button
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Remover chat"
                            type="button"
                          >
                            <span class="pictograma-eliminar" aria-hidden="true" />
                          </button>
                        </div>
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
        <button class="boton-primario boton-chico" aria-label="Iniciar chat" type="button">
          Iniciar chat
        </button>
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
  &:hover {
    text-decoration: none !important;
    background-color: var(--fondo-acento);
    border-color: var(--borde-acento);
    box-shadow: none;
    color: inherit;
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
