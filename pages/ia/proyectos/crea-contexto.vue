<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import ListaProyectos from "~/components/ia/ListaProyectos.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";

import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
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
        <div class="contenedor-vista-ia">
          <div class="contenedor">
            <div class="grid">
              <div
                class="columna-16 flex flex-contenido-separado contexto-encabezado"
              >
                <h2>Configuración del contexto</h2>
                <NuxtLink
                  class="boton boton-secundario boton-chico"
                  aria-label="Regresar a proyectos"
                  to="/ia/proyectos/"
                >
                  Regresar a proyectos
                  <span
                    class="pictograma-flecha-izquierda"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </div>
            </div>
            <div class="grid">
              <div class="columna-10">
                <form action="">
                  <SisdaiCampoBase
                    etiqueta="Nombre del contexto"
                    ejemplo=""
                    :es_etiqueta_visible="true"
                    class="m-b-3"
                  />

                  <SisdaiAreaTexto
                    etiqueta="Descripción del contexto (opcional)"
                    class="m-b-3"
                  />

                  <SisdaiCampoBase
                    etiqueta="Portada del proyecto"
                    tipo="file"
                    class="m-b-3"
                  />
                </form>
              </div>
            </div>
            <div class="grid">
              <div class="columna-16">
                <div class="separador m-b-3"></div>
                <h2 class="m-b-2">Selecciona fuentes de información</h2>
                <div class="m-b-2">
                  Puedes seleccionar fuentes de información agregadas o subidas
                  al proyecto, para añadir más fuentes de información ve a la
                  configuración del proyecto
                </div>
                <h6 class="m-t-0 m-b-2">
                  Fuentes de información disponibles en el proyecto:
                  Biodiversidad de ecosistemas marinos
                </h6>
                <div class="flex flex-contenido-final">
                  <NuxtLink
                    class="boton boton-primario boton-chico"
                    aria-label="Guardar contexto"
                    to="/ia/proyectos"
                    @click="storeIA.crearContexto()"
                  >
                    Guardar contexto
                  </NuxtLink>
                  <button
                    class="boton-chico boton-secundario"
                    aria-label="Cancelar"
                  >
                    Cancelar
                  </button>
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
.contexto-encabezado {
  align-items: center;
}
</style>
