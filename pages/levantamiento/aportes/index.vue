<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { formatDate } from '~/utils/levantamiento';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const router = useRouter();
const route = useRoute();

const aprobados = ref([
  {
    id: 0,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Aprobado',
  },
  {
    id: 1,
    thumbnail_img: 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    title: 'Título del aporte',
    update_date: formatDate(new Date()),
    status: 'Aprobado',
  },
]);

const modalEditarAporte = ref(null);
const modalRemoverAporte = ref(null);

const aporteSeleccionado = ref({});
/**
 * Abre el modal de editar aporte y asigna el aporte seleccionado
 * @param aporte del que se va a editar
 */
function editarAporte(aporte) {
  modalEditarAporte.value?.abrirModal();
  aporteSeleccionado.value = aporte;
}
/**
 * Cierra el modal de editar aporte y navega a la vista de editar
 * con los querys de título y ruta previa
 */
function irAEditarAporte() {
  modalEditarAporte.value?.cerrarModal();
  router.push({
    path: `/levantamiento/aportes/editar/${aporteSeleccionado.value.id}`,
    query: {
      title: aporteSeleccionado.value.title,
      previous_path: route.path,
    },
  });
}

const modalCrearAporte = ref(null);
const seleccionProyectos = ref('');
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
              <h2>Aportes aprobados</h2>
              <UiNumeroElementos :numero="0" />
            </div>
          </div>
          <div class="columna-16">
            <div class="flex flex-contenido-centrado">
              <div class="columna-8 flex-vertical-centrado" style="height: 58vh">
                <div class="fondo-color-acento borde-redondeado-16 texto-centrado p-b-3">
                  <span
                    class="pictograma-documento texto-color-acento texto-tamanio-8 m-t-1"
                  ></span>
                  <h3 class="texto-color-acento m-t-0">Empieza a realizar aportes</h3>
                  <p>Cuando tus aportes sean aprobados podrás verlos en esta sección</p>
                  <button
                    class="boton-primario boton-chico"
                    type="button"
                    @click="modalCrearAporte.abrirModal()"
                  >
                    Crear un aporte
                    <span class="pictograma-agregar" aria-hidden="true"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="false" class="columna-16">
            <div class="grid">
              <div class="columna-8">
                <!-- Buscador -->
              </div>
              <div class="columna-16">
                <div class="contenedor-aprobados">
                  <div class="grid">
                    <div v-for="value in aprobados" :key="value.id" class="columna-5">
                      <div class="tarjeta" style="position: relative">
                        <img class="tarjeta-imagen" alt="" :srcset="value.thumbnail_img" />

                        <div class="tarjeta-cuerpo">
                          <p class="tarjeta-etiqueta">Aporte creado en:</p>
                          <p class="tarjeta-titulo">{{ value.title }}</p>
                          <p>{{ value.update_date }}</p>
                        </div>

                        <div class="tarjeta-pie" style="display: block">
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
                              @click="modalRemoverAporte.abrirModal()"
                            >
                              Eliminar aporte
                            </button>
                          </div>
                        </div>
                        <p
                          class="fondo-color-confirmacion texto-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
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
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalCrearAporte">
          <template #encabezado> <h2>Selecciona un proyecto</h2> </template>
          <template #cuerpo>
            <ClientOnly>
              <SisdaiSelector
                v-model="seleccionProyectos"
                etiqueta="Proyectos disponibles"
                :es_obligatorio="true"
              >
                <option value="1">Opcion Uno</option>
                <option value="2">Opcion Dos</option>
                <option value="3">Opcion Tres</option>
              </SisdaiSelector>
            </ClientOnly>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalCrearAporte.cerrarModal()"
            >
              Regresar
            </button>
            <!-- <button class="boton-primario boton-chico" type="button"">
              Siguiente
            </button> -->
          </template>
        </SisdaiModal>

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
            <button class="boton-primario boton-chico" type="button" @click="irAEditarAporte()">
              Continuar con la edición
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
