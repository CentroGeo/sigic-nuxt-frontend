<script setup>
definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const { data } = useAuth();

onMounted(() => {
  storeLevantamiento.obtenerAportesPorStatusRevisor(data.value?.user.email, 'EN REVISION');
});
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
            { texto: 'Aprobados', ruta: '/levantamiento/revision-aportes' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-aportes/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-aportes/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Aportes en revisión</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.aportesEnRevision.length"
            etiqueta="Aportes"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenAportesEnRevision"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">No tienes aportes por revisar</h6>
            <p class="m-t-0 m-b-1">
              Cuando algún aporte sea enviado a aprobación lo podrás revisar en esta sección.
            </p>
          </div>
          <div class="columna-4"></div>
        </div>
        <div v-else>
          <div class="grid">
            <div
              v-for="aporte in storeLevantamiento.aportesEnRevision"
              :key="aporte.id"
              class="columna-5"
            >
              <div class="tarjeta" style="position: relative">
                <img class="tarjeta-imagen" alt="" srcset="/img/aporte_imagen.png" />

                <div class="tarjeta-cuerpo">
                  <p class="texto-tamanio-3 texto-color-secundario">Aporte creado en:</p>
                  <p class="tarjeta-titulo">{{ aporte.title }}</p>
                  <!-- <p class="texto-tamanio-3 texto-color-secundario">
                        {{ aporte.fecha_formateada }}
                      </p> -->
                </div>

                <div class="tarjeta-pie" style="display: block">
                  <div class="flex" style="row-gap: 8px">
                    <button
                      class="boton-primario boton-chico texto-centrado tarjeta-pie-boton"
                      type="button"
                      @click="editarAporte(aporte)"
                    >
                      Editar aporte
                    </button>
                    <button
                      class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                      type="button"
                      @click="seleccionarAporte(aporte)"
                    >
                      Eliminar aporte
                    </button>
                  </div>
                </div>
                <p
                  class="borde borde-redondeado-12 p-1 fondo-color-alerta texto-color-alerta borde-color-alerta"
                  style="position: absolute; top: 0; right: 24px"
                >
                  Por revisar
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.titulo-contenido-levantamiento {
  align-items: center;
}

.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}

.icono-proyecto {
  width: 40px;
  height: 40px;
}

.boton-accion-proyecto {
  width: 100%;
  justify-content: center;
}

.tarjeta-pie-boton {
  width: 100%;
  display: inline-block;
}

.tarjeta-imagen {
  height: 130px;
}

.tarjeta-cuerpo > * {
  margin: 8px 0;
}
</style>
