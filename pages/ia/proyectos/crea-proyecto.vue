<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";
import SisdaiGrupoBotonesRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue";
import SisdaiBotonRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue";

import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
</script>
<template>
  <LayoutIA>
    <div class="grid">
      <div class="columna-4">
        <PanelListas>
          <h6 class="m-t-0">Proyectos</h6>
        </PanelListas>
      </div>

      <div class="columna-12">
        <!-- Vista CreaProyecto -->
        <div class="contenedor">
          <h2>Configuración de proyecto</h2>
          <div class="grid">
            <div class="columna-10">
              <form action="">
                <SisdaiCampoBase
                  etiqueta="Nombre del proyecto"
                  ejemplo=""
                  :es_etiqueta_visible="true"
                  class="m-b-3"
                />

                <SisdaiAreaTexto
                  etiqueta="Descripción del proyecto"
                  class="m-b-3"
                />

                <SisdaiGrupoBotonesRadio leyenda="Visibilidad">
                  <SisdaiBotonRadio
                    etiqueta="Público"
                    value="publico"
                    name="visibilidad"
                  />
                  <SisdaiBotonRadio
                    etiqueta="Privado"
                    value="privado"
                    name="visibilidad"
                  />
                </SisdaiGrupoBotonesRadio>
              </form>
            </div>
          </div>
          <div class="grid">
            <div class="columna-16">
              <div class="separador m-b-3"></div>
              <div class="flex flex-contenido-separado fuentes-encabezado">
                <h2>Agregar fuentes de información</h2>
                <div class="">
                  <button
                    class="boton-pictograma boton-primario m-r-2"
                    aria-label="Agregar del catalogo"
                  >
                    Agregar del catálogo
                    <span class="pictograma-agregar" aria-hidden="true" />
                  </button>
                  <button
                    class="boton-pictograma boton-primario"
                    aria-label="Subir archivos"
                  >
                    Subir archivos
                    <span class="pictograma-archivo-subir" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink
            class="boton boton-primario"
            aria-label="Crear proyecto"
            to="/ia/proyectos"
            @click="storeIA.crearProyecto()"
          >
            Crear proyecto
          </NuxtLink>
        </div>
      </div>
    </div>
  </LayoutIA>
</template>

<style lang="scss">
.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.fuentes-encabezado {
  align-items: center;
}
</style>
