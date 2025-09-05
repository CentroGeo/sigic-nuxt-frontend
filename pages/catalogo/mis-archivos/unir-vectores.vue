<script setup>
// import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const route = useRoute();

const seleccionEjemplo = ref('');
const unionExitosa = ref(false);

/**
 * Obtiene la data del query route de la vista de donde viene.
 * @returns {Object} objeto decodificado con la propiedad de pk
 */
function getUserData() {
  /* if (route.query.userObject) {
    try {
      return JSON.parse(route.query.userObject);
    } catch (e) {
      console.error('Error parsing user object', e);
      return null;
    }
  } */
  if (route.query.data) {
    try {
      const dataStr = decodeURIComponent(route.query.data);
      return computed(() => JSON.parse(dataStr));
    } catch (e) {
      console.error('Error al parsear el objeto', e);
      return null;
    }
  }
}
const objetoId = ref(getUserData());

// obtener el resource completo a partir del id
const resource = ref({});
resource.value = await $fetch('/api/objeto', {
  method: 'POST',
  body: { id: objetoId.value.pk },
});

// evitar problemas con espacios con JSON.stingify
const pk = ref(encodeURIComponent(JSON.stringify({ pk: resource.value.pk })));
function irAMetadatosConQuery() {
  navigateTo({
    path: '/catalogo/mis-archivos/editar-metadatos',
    query: { data: pk.value },
  });
}
function irAClaveConQuery() {
  navigateTo({
    path: '/catalogo/mis-archivos/unir-vectores',
    query: { data: pk.value },
  });
}

// TODO: unir vectores con el backend
// const { data } = useAuth();
async function aplicarJoin() {
  // await $fetch('/api/metadatos', {
  //   method: 'POST',
  //   body: {
  //     pk: resource.value.pk,
  //     resource_type: resource.value.resource_type,
  //     abstract: campoResumen.value,
  //     token: data.value?.accessToken,
  //   },
  // });
  unionExitosa.value = true;
}

const bordeEnlaceActivo = (ruta) => {
  if (route.path === ruta) {
    return 'borde-enlace-activo';
  }
  return '';
};
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-4">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex m-t-3">
            <nuxt-link
              :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar-metadatos')"
              @click="irAMetadatosConQuery"
              >Metadatos
            </nuxt-link>
            <nuxt-link
              :class="bordeEnlaceActivo('/catalogo/mis-archivos/unir-vectores')"
              @click="irAClaveConQuery"
              >Clave Geoestadística
            </nuxt-link>
          </div>
          <div class="borde-b borde-color-secundario"></div>

          <p>
            Agrega a tus datos tabulados un campo geoespacial. Esto permitirá convertirlo en un
            archivo de capa geográfica (.shp, .geojson, entre otros), haciéndolo compatible con el
            visor de mapas y otras herramientas de análisis espacial dentro de SIGIC.
          </p>

          <div
            v-if="unionExitosa"
            class="fondo-color-confirmacion texto-color-confirmacion borde borde-color-confirmacion borde-redondeado-16 p-x-2 m-t-2"
          >
            <p>
              <span class="pictograma-aprobado" />
              Se ha agregado el campo con éxito, ya puedes visualizar tu archivo como capa.
            </p>
          </div>

          <!-- Formulario -->
          <div class="m-t-3">
            <div class="flex">
              <div class="columna-16">
                <h3>{{ resource.title }}</h3>
                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionEjemplo"
                    etiqueta="Tipo de Clave Geoestadística"
                  >
                    <option value="1">ClaveGeo</option>
                    <option value="2">Nombre de identidad</option>
                    <option value="3">CLAVE INEGI</option>
                    <option value="4">Coordenadas</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
              <div class="columna-16">
                <div class="flex">
                  <nuxt-link
                    class="boton-secundario boton-chico"
                    type="button"
                    to="/catalogo/mis-archivos"
                    >Ir a mis archivos
                  </nuxt-link>
                  <button
                    class="boton-primario boton-chico"
                    :disabled="!seleccionEjemplo.trim() >= 1"
                    @click="aplicarJoin"
                  >
                    Unir campo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.borde-enlace-activo {
  border-bottom: 4px solid var(--boton-primario-borde);
  border-radius: 0px;
}
</style>
