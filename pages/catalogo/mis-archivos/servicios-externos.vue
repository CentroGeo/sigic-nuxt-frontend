<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const seleccionTipoFuente = ref('');
const campoURL = ref('');
const casillaUnicaAutenticacion0 = ref(false);
const casillaUnicaAutenticacion1 = ref(false);
const casillaUnicaAutenticacion2 = ref(false);
const mensajeImportarCatalogo = ref('');

const { data } = useAuth();
const token = ref(data.value?.accessToken);
const responseOk = ref(false);
const servicioExternoCreado = ref(true);

async function importarCatalogoExterno() {
  // type: 'REST_MAP'
  // url:
  // const { body } = await $fetch('/api/externo', {
  //   method: 'POST',
  //   body: { url: campoURL.value, type: 'REST_MAP', token: token.value },
  // });
  // console.log('body', body)
  mensajeImportarCatalogo.value = 'Los recursos seleccionados han sido importados';
}

async function crearCatalogoExterno() {
  // type: 'REST_MAP'
  // url:
  // const { body } = await $fetch('/api/externo', {
  //   method: 'POST',
  //   body: { url: campoURL.value, type: 'REST_MAP', token: token.value },
  // });
  // console.log('body', body)
  responseOk.value = true;
  if (responseOk.value) {
    servicioExternoCreado.value = true;
  }
}
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <div class="alineacion-izquierda ancho-lectura">
          <h2>Conexión a catálogos externos</h2>
          <h3>Datos generales del servicio</h3>

          <form @keypress.enter.exact.prevent="conectarCatalogoExterno()">
            <ClientOnly class="flex">
              <!-- <SisdaiCampoBase
                      v-model="campoTitulo"
                      etiqueta="Título"
                      ejemplo="Añade un nombre"
                    /> -->
              <SisdaiCampoBase
                v-model="campoURL"
                etiqueta="Servicio URL"
                ejemplo="http://"
                tipo="url"
              />
              <SisdaiSelector
                v-model="seleccionTipoFuente"
                etiqueta="Tipo de servicio"
                class="m-y-1"
              >
                <option value="1">las opciones las pasa el backend</option>
                <option value="2">las opciones las pasa el backend</option>
              </SisdaiSelector>
            </ClientOnly>
            <div class="flex flex-contenido-final">
              <button
                class="boton-primario"
                aria-label="Aplicar filtros"
                type="button"
                @click="crearCatalogoExterno()"
              >
                Crear
              </button>
            </div>
          </form>

          <div v-if="servicioExternoCreado">
            <h3>Importar</h3>
            <form @keypress.enter.exact.prevent="importarCatalogoExterno()">
              <table class="tabla-condensada">
                <caption>
                  Nombre del servicio
                </caption>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Título</th>
                    <th>Resumen</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion
                          v-model="casillaUnicaAutenticacion0"
                          :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/1`"
                        />
                      </ClientOnly>
                    </td>
                    <td>Estados</td>
                    <td></td>
                    <td>Capa</td>
                  </tr>
                  <tr>
                    <td>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion
                          v-model="casillaUnicaAutenticacion1"
                          :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2`"
                        />
                      </ClientOnly>
                    </td>
                    <td>Municipios</td>
                    <td></td>
                    <td>Capa</td>
                  </tr>
                  <tr>
                    <td>
                      <ClientOnly>
                        <SisdaiCasillaVerificacion
                          v-model="casillaUnicaAutenticacion2"
                          :etiqueta="`https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/3`"
                        />
                      </ClientOnly>
                    </td>
                    <td>Localidades</td>
                    <td></td>
                    <td>Capa</td>
                  </tr>
                </tbody>
              </table>
              <div class="flex flex-contenido-final m-t-2">
                <button
                  class="boton-primario"
                  aria-label="Aplicar filtros"
                  type="button"
                  @click="importarCatalogoExterno()"
                >
                  Importar
                </button>
              </div>
            </form>
          </div>

          <p
            v-if="mensajeImportarCatalogo"
            class="texto-color-confirmacion fondo-color-confirmacion p-1 borde borde-color-confirmacion borde-redondeado-8"
            style="width: fit-content"
          >
            <span class="pictograma-aprobado"></span>{{ mensajeImportarCatalogo }}
          </p>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
