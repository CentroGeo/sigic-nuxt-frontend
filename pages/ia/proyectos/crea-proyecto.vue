<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";
import SisdaiGrupoBotonesRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue";
import SisdaiBotonRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";

import { useIAStore } from "~/stores/ia.js";
import { ref } from "vue";

const catalogoModal = ref(null);

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
                <div>
                  <button
                    class="boton-pictograma boton-primario m-r-2"
                    aria-label="Agregar del catalogo"
                    @click="catalogoModal?.abrirModal()"
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
              <div class="flex flex-contenido-final">
                <NuxtLink
                  class="boton boton-chico boton-primario"
                  aria-label="Guardar proyecto"
                  to="/ia/proyectos"
                  @click="storeIA.crearProyecto()"
                >
                  Guardar proyecto
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

    <SisdaiModal ref="catalogoModal">
      <template #encabezado>
        <h2>Agregar información del catálogo</h2>
      </template>

      <template #cuerpo>
        <p>
          Selecciona el tipo de fuente de información que deseas agregar a tu
          proyecto
        </p>
        <SisdaiGrupoBotonesRadio
          leyenda=""
          :es_obligatorio="false"
          class="radio-catalogo"
        >
          <SisdaiBotonRadio
            etiqueta="Capas geográficas"
            value="Uno"
            name="nombredelgrupo"
            :es_obligatorio="false"
          />
          <SisdaiBotonRadio
            etiqueta="Tabulados de datos"
            value="Dos"
            name="nombredelgrupo"
            :es_obligatorio="false"
          />
          <SisdaiBotonRadio
            etiqueta="Documentos"
            value="Tres"
            name="nombredelgrupo"
            :es_obligatorio="false"
          />
        </SisdaiGrupoBotonesRadio>
      </template>

      <template #pie>
        <button type="button" class="boton-primario boton-chico">
          Siguiente
        </button>
      </template>
    </SisdaiModal>
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

.radio-catalogo {
  .grupo-formulario {
    flex-direction: column;
  }
}
</style>
