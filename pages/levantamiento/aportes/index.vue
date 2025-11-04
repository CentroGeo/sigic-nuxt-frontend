<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

/**
 * Formatea la fecha a la forma dd/mm/yyy 00:00 AM
 * @param date objeto tipo fecha a formatear
 */
function formatDate(date) {
  const formatter = ref();
  formatter.value = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
  });
  const formattedTime = formatter.value.format(date);
  formatter.value = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' });
  const formattedDate = formatter.value.format(date);
  return `${formattedDate} ${formattedTime}`;
}

const aportes = ref([
  {
    id: 0,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
  },
  {
    id: 1,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
  },
]);

const modalRemoverAporte = ref(null);
const modalEditarAporte = ref(null);
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

        <div class="flex">
          <h2>Aportes aprobados</h2>
          <UiNumeroElementos :numero="0" />
        </div>
        <!-- Buscador -->
        <div class="contenedor-aportes">
          <div class="grid">
            <div v-for="value in aportes" :key="value.id" class="columna-5">
              <div class="tarjeta" style="position: relative">
                <img class="tarjeta-imagen" alt="" :srcset="value.thumbnail_img" />

                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Aporte creado en:</p>
                  <p class="tarjeta-titulo">{{ value.title }}</p>
                  <p>{{ value.update_date }}</p>
                </div>

                <div class="tarjeta-pie">
                  <button
                    class="boton-primario boton-chico texto-centrado tarjeta-pie-boton"
                    type="button"
                    @click="modalEditarAporte.abrirModal()"
                  >
                    Editar aporte
                  </button>
                  <button
                    class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                    type="button"
                    @click="modalRemoverAporte.abrirModal()"
                  >
                    Eliminar aporte
                  </button>
                </div>
                <p
                  class="fondo-color-confirmacion texto-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
                  style="position: absolute; top: 0; right: 24px"
                >
                  Aprobado
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ClientOnly>
        <SisdaiModal ref="modalEditarAporte">
          <template #encabezado> <h2>Editar aporte</h2> </template>
          <template #cuerpo>
            <p>
              Este aporte ya fue aprobado. Si realizas cambios, deberá enviarse nuevamente a
              revisión antes de publicarse. ¿Deseas continuar?
            </p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalEditarAporte.cerrarModal()"
            >
              Cancelar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalRemoverAporte">
          <template #encabezado> <h2>Eliminar aporte</h2> </template>
          <template #cuerpo>
            <p>
              Este aporte ya fue aprobado. Si lo eliminas, se borrará permanentemente y no podrás
              recuperarlo. ¿Deseas continuar?
            </p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalRemoverAporte.cerrarModal()"
            >
              Cancelar
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
