<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { formatDate } from '~/utils/levantamiento';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const router = useRouter();
const route = useRoute();

const porEnviar = ref([
  /* {
    id: 0,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Por enviar',
  },
  {
    id: 1,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Por enviar',
  }, */
]);

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

const { data } = useAuth();

onMounted(async () => {
  const aportes = await storeLevantamiento.obtenerAportesPorStatus(
    data.value?.user.email,
    'POR ENVIAR'
  );

  porEnviar.value = aportes.map((item) => ({
    ...item,
    fecha_formateada: formatDate(new Date(item.fecha_levantamiento)),
  }));
});

function seleccionarAporte(aporte) {
  aporteSeleccionado.value = aporte;
  modalRemoverAporte.value.abrirModal();
}

const modalAporteEliminado = ref(null);
let timeoutModal = null;

async function eliminarAporte() {
  const id = aporteSeleccionado.value.id;

  await storeLevantamiento.eliminarAporte(id);

  modalRemoverAporte.value.cerrarModal();

  modalAporteEliminado.value.abrirModal();

  porEnviar.value = porEnviar.value.filter((item) => item.id !== id);

  if (timeoutModal) clearTimeout(timeoutModal);
  timeoutModal = setTimeout(() => {
    modalAporteEliminado.value.cerrarModal();
    timeoutModal = null;
  }, 3000);
}

const modalAporteCompletado = ref(null);

function seleccionarAporteParaEnvio(aporte) {
  aporteSeleccionado.value = aporte;
  enviarARevision();
}

async function enviarARevision() {
  const id = aporteSeleccionado.value.id;

  await storeLevantamiento.actualizarEstadoAporte(id);

  modalAporteCompletado.value.abrirModal();
  porEnviar.value = porEnviar.value.filter((item) => item.id !== id);
}

function irAProyectos() {
  router.push('/levantamiento/proyectos/');
}

function irAAportes() {
  router.push('/levantamiento/aportes/');
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
              <h2>Aportes por enviar</h2>
              <UiNumeroElementos :numero="porEnviar.length" />
            </div>
          </div>
          <div class="columna-8">
            <!-- Buscador -->
          </div>
          <div class="columna-16">
            <div class="contenedor-por-enviar">
              <div class="grid">
                <div v-for="value in porEnviar" :key="value.id" class="columna-5">
                  <div class="tarjeta">
                    <img class="tarjeta-imagen" alt="" srcset="/img/aporte_imagen.png" />

                    <div class="tarjeta-cuerpo">
                      <p class="texto-tamanio-3 texto-color-secundario">Aporte creado en:</p>
                      <p class="tarjeta-titulo">{{ value.title }}</p>
                      <p class="texto-tamanio-3 texto-color-secundario">
                        {{ value.fecha_formateada }}
                      </p>
                    </div>

                    <div class="tarjeta-pie">
                      <div class="flex" style="row-gap: 8px">
                        <button
                          class="boton-primario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="seleccionarAporteParaEnvio(value)"
                        >
                          Enviar a revisión
                        </button>
                        <button
                          class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="editarAporte(value)"
                        >
                          Editar aporte
                        </button>
                        <button
                          class="boton-secundario boton-chico texto-centrado tarjeta-pie-boton"
                          type="button"
                          @click="seleccionarAporte(value)"
                        >
                          Eliminar aporte
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
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
            <button class="boton-primario boton-chico" type="button" @click="eliminarAporte">
              Confirmar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal id="aporteEliminadoModal" ref="modalAporteEliminado">
          <template #encabezado><h3>Aporte eliminado</h3></template>
          <template #cuerpo>
            <div
              class="fondo-color-confirmacion p-x-2 p-y-1 borde borde-color-confirmacion borde-redondeado-20"
            >
              <p class="texto-color-confirmacion">
                <span class="pictograma-aprobado" />
                El aporte y toda su información relacionada se ha eliminado con éxito.
              </p>
            </div>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalAporteCompletado">
          <template #encabezado><h3>Aporte completado</h3></template>
          <template #cuerpo>
            <p class="m-t-0 m-b-3">
              Tu aporte se ha enviado a revisión correctamente. Puedes revisar su estatus en la
              sección de "Aportes".
            </p>
          </template>
          <template #pie>
            <button type="button" class="boton-secundario boton-chico" @click="irAAportes">
              Ir a aportes
            </button>
            <button type="button" class="boton-primario boton-chico" @click="irAProyectos">
              Ir a proyectos
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

.tarjeta-imagen {
  height: 130px;
}

.tarjeta-cuerpo > * {
  margin: 8px 0;
}
</style>
