<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { formatDate } from '~/utils/levantamiento';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const rechazados = ref([
  {
    id: 0,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Rechazado',
  },
  {
    id: 1,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Rechazado',
  },
]);

const modalMensajes = ref(null);
const modalRemoverAporte = ref(null);
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Aprobados', ruta: '/levantamiento/aportes' },
            {
              texto: 'Por modificar',
              ruta: '/levantamiento/aportes/por-modificar',
              notificacion: false,
            },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/aportes/en-revision',
              notificacion: true,
            },
            {
              texto: 'Por enviar',
              ruta: '/levantamiento/aportes/por-enviar',
              notificacion: true,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/aportes/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="grid">
          <div class="columna-16">
            <div class="flex">
              <h2>Aportes rechazados</h2>
              <UiNumeroElementos :numero="0" />
            </div>
          </div>
          <div class="columna-8">
            <!-- Buscador -->
          </div>
          <div class="columna-16">
            <div
              class="fondo-color-alerta texto-color-alerta borde borde-color-alerta borde-redondeado-16 p-3"
            >
              <p class="m-0">
                Los aportes rechazados no pueden modificarse y se eliminarán automáticamente después
                de 10 días. Puedes consultar los motivos del dictamen desde el botón "Mensajes" de
                cada aporte.
              </p>
            </div>
          </div>
          <div class="columna-16">
            <div class="contenedor-rechazados">
              <div class="grid">
                <div v-for="value in rechazados" :key="value.id" class="columna-5">
                  <div class="tarjeta" style="position: relative">
                    <img class="tarjeta-imagen" alt="" :srcset="value.thumbnail_img" />

                    <div class="tarjeta-cuerpo">
                      <p class="tarjeta-etiqueta">Aporte creado en:</p>
                      <p class="tarjeta-titulo">{{ value.title }}</p>
                      <p>{{ value.update_date }}</p>
                    </div>

                    <div class="tarjeta-pie">
                      <div class="flex" style="row-gap: 8px">
                        <button
                          class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="modalMensajes.abrirModal()"
                        >
                          Mensajes
                        </button>
                        <button
                          class="boton-primario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="modalRemoverAporte.abrirModal()"
                        >
                          Eliminar aporte
                        </button>
                      </div>
                    </div>
                    <p
                      class="fondo-color-error texto-color-error borde borde-color-error borde-redondeado-8 p-1"
                      style="position: absolute; top: 0; right: 24px"
                    >
                      {{ value.status }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ClientOnly>
        <SisdaiModal ref="modalMensajes">
          <template #encabezado> <h2>Aporte rechazado</h2> </template>
          <template #cuerpo>
            <p>Tu aporte fue rechazado, estos fueron los motivos.</p>
            <p
              class="fondo-color-error texto-color-error borde borde-color-error borde-redondeado-16 p-3"
            >
              Se utilizó un lenguaje violento o despectivo
            </p>
            <p
              class="fondo-color-error texto-color-error borde borde-color-error borde-redondeado-16 p-3"
            >
              Se enviaron imágenes incorrectas o no correspondientes al aporte en más de una ocasión
            </p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalMensajes.cerrarModal()"
            >
              Cerrar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalRemoverAporte">
          <template #encabezado> <h2>Eliminar aporte</h2> </template>
          <template #cuerpo>
            <p>¿Deseas eliminar este aporte? Esta acción no se puede deshacer.</p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalRemoverAporte.cerrarModal()"
            >
              Regresar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.tarjeta-pie-boton {
  width: 100%;
  display: inline-block;
}
</style>
