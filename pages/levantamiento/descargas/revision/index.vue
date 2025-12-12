<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'auth',
});
const storeLevantamiento = useLevantamientoStore();
const modalSolicitarDescarga = ref(null);
const modalDescargaSolicitada = ref(null);

const handleDescarga = () => {
  modalSolicitarDescarga.value.cerrarModal();
  modalDescargaSolicitada.value.abrirModal();
};
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="principal-levantamiento flex contenedor m-b-10 m-t-3">
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Aprobadas', ruta: '/levantamiento/descargas', notificacion: false },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/descargas/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazadas',
              ruta: '/levantamiento/descargas/rechazadas',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Descargas en revisión</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.obtenerTotalDescargasEnRevision()"
            etiqueta="Descargas"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenDescargasEnRevision"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">Aun no hay descargas en revisión</h6>
            <p class="m-t-0 m-b-1">
              Todas las descargas en proceso de revisión aparecerán en esta sección.
            </p>
            <div class="texto-centrado">
              <button
                class="boton-primario boton-chico"
                @click="modalSolicitarDescarga.abrirModal()"
              >
                Solicitar una descarga
                <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
              </button>
            </div>
          </div>
          <div class="columna-4"></div>
        </div>

        <div v-else class="grid">
          <div
            v-for="descarga in storeLevantamiento.descargasEnRevision"
            :key="descarga.id"
            class="columna-5 fondo-color-neutro p-3 borde-redondeado-20"
          >
            <div class="flex flex-contenido-separado encabezado-descarga m-b-3">
              <span class="pictograma-capas pictograma-grande texto-color-acento"></span>
              <p
                class="borde borde-redondeado-12 p-x-1 p-y-minimo fondo-color-alerta texto-color-alerta borde-color-alerta m-0"
              >
                En revisión
              </p>
            </div>
            <div class="m-b-3">
              <div class="texto-color-secundario">Datos del proyecto:</div>
              <div class="m-b-minimo texto-tamanio-4 nombre-proyecto">
                <b>{{ descarga.nombre_proyecto }}</b>
              </div>
            </div>
            <div class="m-b-3 texto-tamanio-2 texto-color-secundario">
              <span class="m-r-2">Solicitante:</span> {{ descarga.solicitante }}
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-minimo">
              <div class="columna-10">Formato:</div>
              <div class="columna-6">
                {{ descarga.formato }}
              </div>
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-minimo">
              <div class="columna-10">Fecha de solicitud:</div>
              <div class="columna-6">
                {{ descarga.fecha_solicitud }}
              </div>
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-3">
              <div class="columna-10">Fecha de aprobación:</div>
              <div class="columna-6">---</div>
            </div>
            <div class="flex acciones-descarga">
              <div class="columna-8">
                <button
                  class="boton-secundario boton-chico boton-accion-proyecto fondo-color-primario m-b-1"
                  type="button"
                >
                  Eliminar
                </button>
              </div>
              <div class="columna-8">
                <button
                  class="boton-primario boton-chico boton-accion-proyecto fondo-color-primario m-b-1"
                  type="button"
                  disabled
                >
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>

        <ClientOnly>
          <SisdaiModal ref="modalSolicitarDescarga">
            <template #encabezado><h3>Descargar datos</h3></template>
            <template #cuerpo>
              <p class="m-t-0 m-b-3">
                Selecciona un proyecto para solicitar la descarga de sus datos
              </p>
              <SisdaiSelector etiqueta="Proyectos disponibles" class="m-b-3">
                <option>Opción 1</option>
                <option>Opción 2</option>
                <option>Opción 3</option>
              </SisdaiSelector>
              <SisdaiAreaTexto
                etiqueta="Describe el uso que le darás a los datos"
                ejemplo="Describe el uso que le darás a los datos..."
                :es_etiqueta_visible="true"
                :es_obligatorio="false"
                class="m-b-3"
              />
              <p class="m-t-0 m-b-3">
                Selecciona el formato en el cual deseas descargar los datos:
              </p>
              <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  etiqueta="Tabulado de datos .csv"
                  value="csv"
                  name="modo-descarga"
                />
                <SisdaiBotonRadio
                  etiqueta="Geopaquete .gpkg"
                  value="geopaquete"
                  name="modo-descarga"
                />
              </SisdaiBotonesRadioGrupo>
            </template>
            <template #pie>
              <button
                type="button"
                class="boton-secundario boton-chico"
                @click="modalSolicitarDescarga?.cerrarModal()"
              >
                Cerrar
              </button>
              <button type="button" class="boton-primario boton-chico" @click="handleDescarga">
                Solicitar descarga
              </button>
            </template>
          </SisdaiModal>

          <SisdaiModal ref="modalDescargaSolicitada">
            <template #encabezado><h3>Descarga solicitada</h3></template>
            <template #cuerpo>
              <div
                class="texto-color-confirmacion fondo-color-confirmacion borde-redondeado-20 borde borde-color-confirmacion p-3 m-b-3"
              >
                <div class="m-0 descarga-notificacion">
                  <span class="pictograma-aprobado"></span>
                  <div>
                    Tu solicitud se ha procesado con éxito, puedes darle seguimiento en la sección
                    “Descargas”.
                  </div>
                </div>
              </div>
            </template>
            <template #pie>
              <button
                type="button"
                class="boton-secundario boton-chico"
                @click="modalDescargaSolicitada?.cerrarModal()"
              >
                Cerrar
              </button>
              <button
                type="button"
                class="boton-primario boton-chico"
                @click="modalDescargaSolicitada?.cerrarModal()"
              >
                Ir a descargas
              </button>
            </template>
          </SisdaiModal>
        </ClientOnly>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.titulo-contenido-levantamiento {
  align-items: center;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}

.encabezado-descarga {
  p {
    align-self: flex-start;
  }
}

.nombre-proyecto {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 22.5px;
  min-height: calc(22.5px * 3);
}

.acciones-descarga {
  button {
    width: 100%;
    justify-content: center;
  }
}
</style>
