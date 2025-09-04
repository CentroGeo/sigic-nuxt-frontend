<script setup>
// import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const route = useRoute();
// function getUserData() {
//   // Función que devuelve el objeto decodificado
//   // de la vista de donde viene
//   // if (route.query.userObject) {
//   //   try {
//   //     return JSON.parse(route.query.userObject);
//   //   } catch (e) {
//   //     console.error('Error parsing user object', e);
//   //     return null;
//   //   }
//   // }
//   if (route.query.data) {
//     try {
//       const dataStr = decodeURIComponent(route.query.data);
//       return computed(() => JSON.parse(dataStr));
//     } catch (e) {
//       console.error('Error al parsear el objeto', e);
//       return null;
//     }
//   }
// }
// const objetoId = ref(getUserData());

const seleccionEjemplo = ref('');
// const seleccionEjemplo2 = ref('');
// const seleccionEjemplo3 = ref('');
// const campoEjemplo = ref(false);
// const campoEjemplo2 = ref(false);
// const campoEjemplo3 = ref(false);
// const campoEjemplo4 = ref(false);
// const campoEjemplo5 = ref(false);
// const campoEjemplo6 = ref(false);
// const campoEjemplo7 = ref(false);
// const campoEjemplo8 = ref(false);
const unionExitosa = ref(false);

// // obtener el resource completo a partir del id
// const resource = ref({});
// resource.value = await $fetch('/api/objeto', {
//   method: 'POST',
//   body: { id: objetoId.value.pk },
// });

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
              :class="`${route.path === '/catalogo/mis-archivos/editar-metadatos/' ? 'borde-enlace-activo' : ''}`"
              to="/catalogo/mis-archivos/editar-metadatos/"
              >Metadatos</nuxt-link
            >
            <nuxt-link
              :class="`${route.path === '/catalogo/mis-archivos/editar-estilo/' ? 'borde-enlace-activo' : ''}`"
              to="/catalogo/mis-archivos/editar-estilo/"
              style=""
              >Estilo</nuxt-link
            >
            <nuxt-link
              :class="`${route.path === '/catalogo/mis-archivos/unir-vectores/' ? 'borde-enlace-activo' : ''}`"
              to="/catalogo/mis-archivos/unir-vectores/"
              >Clave Geoestadística</nuxt-link
            >
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
                <h3>{ { Archivo CSV sin geometría } }</h3>
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
                  <!-- <SisdaiSelector
                    v-model="seleccionEjemplo"
                    etiqueta="Campo a vincular"
                    texto_ayuda="El campo o columna del archivo tabulado CSV sin geometría que se va a unir."
                  >
                    <option value="1">CVE_GEO</option>
                    <option value="2">ENTIDAD</option>
                    <option value="3">MUN</option>
                    <option value="4">...otro campo</option>
                    <option value="5">...otro campo</option>
                  </SisdaiSelector> -->
                </ClientOnly>
              </div>
              <!-- <div class="columna-16">
                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionEjemplo2"
                    etiqueta="Capa objetivo"
                    texto_ayuda="Selecciona la capa con la que se quiere vincular."
                  >
                    <option value="1">Qro_mun_pob2020</option>
                    <option value="2">...otra capa</option>
                    <option value="3">...otra capa</option>
                  </SisdaiSelector>
                  <SisdaiSelector
                    v-model="seleccionEjemplo3"
                    etiqueta="Campo objetivo"
                    texto_ayuda="El nombre de la columna de la capa objetivo."
                  >
                    <option value="1">CVEGEO</option>
                    <option value="2">CVE_ENT</option>
                    <option value="3">CVE_MUN</option>
                    <option value="4">...otro campo</option>
                  </SisdaiSelector>
                </ClientOnly>
              </div>
              <div class="columna-16">
                <ClientOnly>
                  <SisdaiCasillaVerificacion
                    v-model="campoEjemplo"
                    etiqueta="Campos unidos"
                    texto_ayuda="Todas las opciones de campos unidos o a unir."
                  />
                </ClientOnly>
                <div v-if="campoEjemplo" class="borde m-t-2 p-1">
                  <ul class="lista-sin-estilo">
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo2" etiqueta="ENTIDAD" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo3" etiqueta="MUN" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo4" etiqueta="CVE_GEO" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo5" etiqueta="NOM_MUN" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo6" etiqueta="POBTOT" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="campoEjemplo7" etiqueta="POBFEM" />
                      </ClientOnly>
                    </li>
                    <li>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion
                          v-model="campoEjemplo8"
                          etiqueta="...otro campo"
                        />
                      </ClientOnly>
                    </li>
                  </ul>
                </div>
              </div> -->
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
