<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { catalogosSugeridos } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();
const { status, signIn } = useAuth();
const route = useRoute();
const servicios = ref([]);
const seleccionOrden = ref('title');
const inputBusqueda = ref('');
const modalServiciosExternos = ref(null);
const modalService = ref({});

/**
 * Manda a iniciar sesión
 */
async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: route.fullPath,
  });
}

/**
 * Resetea el input del buscador
 */
function resetInput() {
  inputBusqueda.value = '';
}

/**
 * Filtra los servicios remotos según el input y el orden seleccionado
 * */
function filterServices() {
  const input = inputBusqueda.value.trim().toLowerCase();
  let data;
  if (input.length > 0) {
    data = catalogosSugeridos.filter(
      (d) =>
        d.abstract.toLowerCase().includes(input) ||
        d.title.toLowerCase().includes(input) ||
        d.descripcion.toLowerCase().includes(input)
    );
  } else {
    data = catalogosSugeridos;
  }

  const serviciosOrdenados = data.sort((a, b) =>
    a[seleccionOrden.value].localeCompare(b[seleccionOrden.value])
  );
  servicios.value = serviciosOrdenados;
}

/**
 * Define el servicio escogido y abre el modal de información.
 */
function showModal(servicio) {
  modalService.value = servicio;
  nextTick(() => {
    modalServiciosExternos.value?.abrirModalCatalogoExterno();
  });
}

watch([inputBusqueda, seleccionOrden], () => {
  filterServices();
});

onMounted(() => {
  filterServices();
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div
          v-if="status !== 'authenticated'"
          class="fondo-color-informacion texto-color-informacion borde-redondeado-16 borde -color-informacion m-2"
          style="padding: 21px"
        >
          <h6 class="m-y-2">¿Quieres registrar un catálogo externo?</h6>
          <p class="m-y-1">
            Puedes registrar catálogos de información para visualizarlos en la plataforma SIGIC.
            para ello debes iniciar sesión con una cuenta existente o crear una y completar el
            proceso de registro e importación.
          </p>
          <a href="#" style="font-weight: bold" @click.prevent="iniciarSesion(event)"
            >Iniciar sesión</a
          >
        </div>
        <div class="flex">
          <div class="columna-8">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="title">Título</option>
                <option value="origen">Origen</option>
                <option value="tipo">Tipo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <div class="columna-8">
            <ClientOnly>
              <ClientOnly>
                <label for="idunicobusqueda"> Campo de búsqueda </label>
                <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                  <input
                    id="idunicobusqueda"
                    v-model="inputBusqueda"
                    type="search"
                    class="campo-busqueda-entrada"
                    placeholder="Campo de búsqueda"
                  />

                  <button
                    style="margin: 0; margin-right: 4px"
                    class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                    aria-label="Borrar"
                    type="button"
                    @click="resetInput"
                  >
                    <span aria-hidden="true" class="pictograma-cerrar" />
                  </button>

                  <button
                    class="boton-primario boton-pictograma campo-busqueda-buscar"
                    aria-label="Buscar"
                    type="button"
                    @click="filterServices"
                  >
                    <span class="pictograma-buscar" aria-hidden="true" />
                  </button>
                </form>
              </ClientOnly>
            </ClientOnly>
          </div>
        </div>

        <div class="flex">
          <h2>Servicios remotos</h2>
          <UiNumeroElementos :numero="servicios.length" />
        </div>
        <p>
          Explora los recursos de información de catálogos precargados. Al importarlos podrás
          agregarlos a tus archivos y utilizarlos en la plataforma SIGIC. Ten en cuenta que deberás
          completar previamente los metadatos de cada uno.
        </p>
        <div class="flex">
          <CatalogoTarjetaServicio
            v-for="catalogo in servicios"
            :key="`${catalogo.id}-${seleccionOrden}`"
            :service="catalogo"
            @service-details-clicked="(servicio) => showModal(servicio)"
          />
        </div>

        <CatalogoModalCatalogoExterno
          v-if="modalService.id"
          :id="modalService.id"
          ref="modalServiciosExternos"
          :service="modalService"
        />
      </main>
    </template>
  </UiLayoutPaneles>
</template>
