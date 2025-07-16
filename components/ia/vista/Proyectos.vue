<script setup>
import { ref } from "vue";

const storeIA = useIAStore();

const proyecto = {
  id: 0,
  titulo: "Biodiversidad de ecosistemas marinos",
  descripcion:
    "Este proyecto de investigación científica se centra en el estudio de la biodiversidad en los ecosistemas marinos de la costa. A través de la recolección de muestras y el análisis genético, buscamos comprender cómo las variaciones en la temperatura del agua afect...",
  numero_contextos: 0,
  numero_fuentes: 9,
  estado: "Privado",
};

const contextos = ref([
  {
    id: 0,
    tarjeta_img:
      "https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg",
    tarjeta_titulo: "Tecnologías para monitoreo marino",
    tarjeta_etiqueta: "5 Fuentes",
    numero_fuentes: 5,
  },
  {
    id: 1,
    tarjeta_img:
      "https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg",
    tarjeta_titulo: "Zonas de riesgo ecológico marino",
    tarjeta_etiqueta: "6 Fuentes",
    numero_fuentes: 6,
  },
]);
</script>

<template>
  <div>
    <div class="contenedor" style="max-height: 85vh; overflow-y: auto">
      <div class="grid">
        <div class="columna-16">
          <div class="flex flex-contenido-separado proyecto-encabezado">
            <div class="flex proyecto-encabezado">
              <h2>{{ proyecto.titulo }}</h2>
              <div class="p-x-1 p-y-minimo proyecto-estado">
                <span>{{ proyecto.estado }}</span>
                <!-- TODO: agregar icono de para privado/publico -->
              </div>
            </div>
            <button class="boton-primario boton-chico" type="button">
              Configurar proyecto
            </button>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="columna-10">
          {{ proyecto.descripcion }}
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
            to="/ia/proyecto/crea-contexto"
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
                v-for="contexto in contextos"
                :key="contexto.id"
                class="columna-4"
              >
                <div class="tarjeta">
                  <img
                    class="tarjeta-imagen"
                    :src="contexto.tarjeta_img"
                    alt=""
                  />
                  <div class="tarjeta-cuerpo">
                    <p class="tarjeta-titulo">
                      {{ contexto.tarjeta_titulo }}
                    </p>
                    <UiNumeroElementos
                      :numero="contexto.numero_fuentes"
                      etiqueta="Fuentes"
                    />
                  </div>
                  <div class="tarjeta-pie">
                    <nuxt-link
                      class="boton-primario boton-chico"
                      type="button"
                      to="/ia/chat/dinamica"
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
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.tarjeta {
  background-color: var(--fondo-acento);
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

.proyecto-estado {
  border-radius: var(--Escalas-Bordes-redondeados-br-2, 8px);
  border: 1px solid var(--Base-Borde---borde-acento, #53323c);
  background: var(--Base-Fondo---fondo-acento, #fcf3f5);
}

.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.contexto-encabezado {
  align-items: center;
}
</style>
