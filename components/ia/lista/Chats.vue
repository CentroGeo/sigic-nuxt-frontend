<!-- TODO: adaptar al LayoutListas.vue -->
<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";

const storeIA = useIAStore();
// TODO: subir lista al store
const chats = ref([
  {
    id: 0,
    titulo: "Cobertura e integración de datos en el monitoreo marino",
    titulo_proyecto: "Biodiversidad de ecosistemas marinos",
    titulo_contexto: "Tecnologías para monitoreo marino",
  },
]);
const listaChatsFiltrada = ref(chats.value);
</script>

<template>
  <div class="p-3">
    <button class="boton boton-primario" aria-label="Crear nuevo chat">
      Nuevo chat
    </button>

    <client-only>
      <SisdaiCampoBusqueda
        class="m-y-3"
        :catalogo="chats"
        etiqueta="Buscar chats"
        propiedad-busqueda="titulo"
        @alFiltrar="(r) => (listaChatsFiltrada = r)"
      />
    </client-only>
    <h6>chats</h6>

    <div v-if="storeIA.existeContexto" class="lista-chats">
      <p>Hoy</p>
      <ul class="lista-sin-estilo" style="max-height: 85vh; overflow-y: auto">
        <li v-for="chat in listaChatsFiltrada" :key="chat.titulo">
          <nuxt-link
            class="tarjeta-chat p-2 fondo-color-neutro borde borde-redondeado-20"
            to="/ia/chat/dinamica"
          >
            <h5 class="tarjeta-titulo m-t-0">{{ chat.titulo }}</h5>
            <p class="tarjeta-nombre-proyecto">
              {{ chat.titulo_proyecto }}
            </p>
            <p class="tarjeta-nombre-contexto">
              {{ chat.titulo_contexto }}
            </p>
            <div class="flex flex-contenido-final">
              <div>
                <nuxt-link
                  class="boton-pictograma boton-sin-contenedor-primario"
                  to="#"
                >
                  <span class="pictograma-editar" aria-hidden="true" />
                </nuxt-link>
                <button
                  class="boton-pictograma boton-sin-contenedor-primario"
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
    </div>
  </div>
</template>
