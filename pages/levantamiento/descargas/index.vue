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
  storeLevantamiento.solicitarDescarga();
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
          <h2>Descargas aprobadas</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.obtenerTotalDescargasAprobadas()"
            etiqueta="Descargas"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenDescargasAprobadas"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">Aun no hay descargas disponibles</h6>
            <p class="m-t-0 m-b-1">
              Todas las descargas solicitadas que sean aprobadas aparecerán en esta sección, podrás
              descargarlas las veces que necesites.
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
              <nuxt-link
                class="boton boton-primario boton-chico"
                to="/levantamiento/descargas/revision"
              >
                Ir a Descargas
              </nuxt-link>
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
</style>
