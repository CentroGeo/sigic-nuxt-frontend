<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import LeyendaInicio from "~/components/ia/LeyendaInicio.vue";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";

import { useIAStore } from "~/stores/ia.js";
import ListaProyectos from "~/components/ia/ListaProyectos.vue";
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

const contextos = [
  {
    id: 0,
    tarjeta_img:
      "https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg",
    tarjeta_titulo: "Tecnologías para monitoreo marino",
    tarjeta_etiqueta: "5 Fuentes",
  },
];
</script>

<template>
  <LayoutIA>
    <div class="grid">
      <div class="columna-4">
        <PanelListas>
          <ListaProyectos />
        </PanelListas>
      </div>

      <div class="columna-12">
        <LeyendaInicio v-if="!storeIA.existenProyectos" />

        <!-- Vista Proyectos -->
        <div v-else class="contenedor">
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
                <button class="boton-primario" type="button">
                  Configurar proyecto
                </button>
              </div>
            </div>
            <div class="columna-10">
              {{ proyecto.descripcion }}
            </div>
          </div>
          <div class="grid">
            <div class="columna-16">
              <div class="separador m-y-3"></div>
            </div>
          </div>
          <h4>Contextos:</h4>
          <NuxtLink
            class="boton boton-secundario"
            aria-label="Crear proyecto"
            to="/ia/proyectos/crea-contexto"
          >
            Crear contexto
          </NuxtLink>

          <div v-if="storeIA.existeContexto">
            <div class="flex m-y-5">
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
                    <p class="tarjeta-etiqueta">
                      {{ contexto.tarjeta_etiqueta }}
                    </p>
                  </div>
                  <div class="tarjeta-pie">
                    <nuxt-link
                      class="boton-primario boton-chico"
                      type="button"
                      to="/ia/chat/dinamica"
                    >
                      Iniciar chat
                      <span class="pictograma-ayuda" aria-hidden="true" />
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
        </div>
      </div>
    </div>
  </LayoutIA>
</template>

<style lang="scss">
.tarjeta .tarjeta-pie {
  display: inline-grid;
  a {
    display: flex;
    justify-content: space-between;
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
</style>
