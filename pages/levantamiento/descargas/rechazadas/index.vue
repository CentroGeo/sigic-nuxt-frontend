<script setup>
definePageMeta({
  middleware: 'auth',
});
const { data } = useAuth();

const storeLevantamiento = useLevantamientoStore();
storeLevantamiento.obtenerTotalDescargasEnRevision(data.value?.user.email);
const eliminarRevision = async (id) => {
  await storeLevantamiento.eliminarDescargaEnRevision(id, data.value?.user.email);

  await storeLevantamiento.obtenerTotalDescargasEnRevision(data.value?.user.email);
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
          <h2>Descargas rechazadas</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.descargasEnRevision?.descargas?.length"
            etiqueta="Descargas"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenDescargasEnRevision"
          class="flex texto-centrado contenido-levantamiento"
        >
          <LevantamientoSolicitaUnaDescarga></LevantamientoSolicitaUnaDescarga>
        </div>

        <div v-else class="grid">
          <div
            v-for="descarga in storeLevantamiento.descargasEnRevision?.descargas"
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
                <b>{{ descarga.nombre_descarga }}</b>
              </div>
            </div>
            <div class="m-b-3 texto-tamanio-2 texto-color-secundario">
              <span class="m-r-2">Solicitante:</span> {{ descarga.usuario_id }}
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-minimo">
              <div class="columna-10">Formato:</div>
              <div class="columna-6">***</div>
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-minimo">
              <div class="columna-10">Fecha de solicitud:</div>
              <div class="columna-6">
                {{
                  new Date(descarga.fecha_solicitud).toLocaleString('es-MX', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                }}
              </div>
            </div>
            <div class="flex texto-tamanio-2 texto-color-secundario m-b-3">
              <div class="columna-10">Fecha de aprobación:</div>
              <div class="columna-6">{{ descarga.fecha_aceptacion }}</div>
            </div>
            <div class="flex acciones-descarga">
              <div class="columna-8">
                <button
                  class="boton-secundario boton-chico boton-accion-proyecto fondo-color-primario m-b-1"
                  type="button"
                  @click="eliminarRevision(descarga.id)"
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
