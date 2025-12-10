<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { formatDate } from '~/utils/levantamiento';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const router = useRouter();
const route = useRoute();

const notificacion = ref(true);

const porModificar = ref([
  {
    id: 0,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Por modificar',
  },
  {
    id: 1,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Por modificar',
  },
]);

const modalMensajes = ref(null);
const modalRemoverAporte = ref(null);

const aporteSeleccionado = ref({});
/**
 * Asigna el aporte seleccionado y navega a la vista de editar
 * @param aporte del que se va a editar
 */
function editarAporte(aporte) {
  aporteSeleccionado.value = aporte;
  irAEditarAporte();
}
/**
 * Navega a la vista de editar con los querys de título y ruta previa
 */
function irAEditarAporte() {
  router.push({
    path: `/levantamiento/aportes/editar/${aporteSeleccionado.value.id}`,
    query: {
      title: aporteSeleccionado.value.title,
      previous_path: route.path,
    },
  });
}
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
              <h2>Aportes por modificar</h2>
              <UiNumeroElementos :numero="0" />
            </div>
          </div>
          <div class="columna-8">
            <!-- Buscador -->
          </div>
          <div class="columna-16">
            <div
              v-if="notificacion"
              class="fondo-color-informacion texto-color-informacion borde borde-color-informacion borde-redondeado-16 p-3"
            >
              <div class="flex flex-contenido-separado">
                <p class="m-0 texto-peso-600 texto-tamanio-4">
                  <span class="pictograma-informacion m-r-1" />Notificaciones
                </p>
                <button
                  class="boton-pictograma boton-sin-contenedor-primario"
                  aria-label="Cerrar notificación"
                  type="button"
                  @click="notificacion = false"
                >
                  <span
                    class="pictograma-cerrar"
                    style="color: var(--texto-informacion)"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <p class="m-0">
                Tienes 1 aporte por modificar, puedes ver las observaciones en el botón "Mensajes"
                de cada aporte
              </p>
            </div>
          </div>
          <div class="columna-16">
            <div class="contenedor-por-modificar">
              <div class="grid">
                <div v-for="value in porModificar" :key="value.id" class="columna-5">
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
                          class="boton-primario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="editarAporte(value)"
                        >
                          Editar aporte
                        </button>
                        <button
                          class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="modalMensajes.abrirModal()"
                        >
                          Mensajes
                        </button>
                        <button
                          class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="modalRemoverAporte.abrirModal()"
                        >
                          Eliminar aporte
                        </button>
                      </div>
                    </div>
                    <p
                      class="fondo-color-alerta texto-color-alerta borde borde-color-alerta borde-redondeado-8 p-1"
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
          <template #encabezado> <h2>Modificaciones pendientes</h2> </template>
          <template #cuerpo>
            <p>
              Realiza las siguientes modificaciones a tu aporte y envíalo de nuevo a aprobación, lo
              revisaremos a la brevedad.
            </p>
            <p
              class="fondo-color-informacion texto-color-informacion borde borde-color-informacion borde-redondeado-16 p-3"
            >
              Agrega una imagen donde se puede ver con claridad el mural
            </p>
            <p
              class="fondo-color-informacion texto-color-informacion borde borde-color-informacion borde-redondeado-16 p-3"
            >
              Agrega mayor información sobre la descripción de la obra
            </p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalMensajes.cerrarModal()"
            >
              Regresar
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
