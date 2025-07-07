<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import LeyendaInicio from "~/components/ia/LeyendaInicio.vue";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";

import { useIAStore } from "~/stores/ia.js";
import ListaProyectos from "~/components/ia/ListaProyectos.vue";
const storeIA = useIAStore();

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
          <h2>Nombre del proyecto</h2>
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
</style>
