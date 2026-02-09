<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { catalogosSugeridos } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();
const { status, signIn } = useAuth();
const route = useRoute();
const servicios = ref(catalogosSugeridos);
const serviciosFiltrados = ref(servicios.value);
const seleccionOrden = ref('titulo');
async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: route.fullPath,
  });
}
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
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_descendente">Más Reciente</option>
                <option value="fecha_ascendente">Más Antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <div class="columna-8">
            <ClientOnly>
              <label for="busquedaServicios"> Campo de búsqueda </label>
              <SisdaiCampoBusqueda
                id="busquedaServicios"
                etiqueta="Buscar..."
                :catalogo="servicios"
                propiedad-busqueda="title"
                style="max-height: 40px"
                @al-filtrar="(r) => (serviciosFiltrados = r)"
              />
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
            :key="catalogo.id"
            :service="catalogo"
          />
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
