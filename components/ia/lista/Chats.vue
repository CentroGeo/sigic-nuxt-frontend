<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";

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

const catalogoFiltrado = ref(catalogo.value);
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
              {{ grupo.fecha == fechaHoy ? "Hoy" : grupo.fecha }}
              <ul class="lista-sin-estilo">
                <li v-for="chat in grupo.chat" :id="chat.id" :key="chat.id">
                  <nuxt-link
                    class="tarjeta-chat p-2 borde borde-redondeado-20"
                    to="/ia/chat/dinamica"
                  >
                    <div>
                      <h5 class="tarjeta-titulo m-t-0">{{ chat.titulo }}</h5>
                      <p class="tarjeta-nombre-proyecto">
                        {{ chat.proyecto }}
                      </p>
                      <p class="tarjeta-nombre-contexto">
                        {{ chat.contexto }}
                      </p>
                      <div class="flex flex-contenido-final">
                        <div>
                          <nuxt-link
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            to="#"
                          >
                            <span
                              class="pictograma-editar"
                              aria-hidden="true"
                            />
                          </nuxt-link>
                          <button
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Remover chat"
                            type="button"
                          >
                            <span
                              class="pictograma-eliminar"
                              aria-hidden="true"
                            />
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
.tarjeta-chat {
  background-color: var(--fondo-acento);
  border: 1px solid var(--borde-acento);
  h5 {
    color: var(--texto-acento);
  }
  p {
    color: var(--texto-primario);
  }
}
</style>
