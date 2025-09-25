<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const selecTipoFuente = ref('');
const campoURL = ref('');
const casillaUnicaAutenticacion0 = ref(false);
const casillaUnicaAutenticacion1 = ref(false);
const casillaUnicaAutenticacion2 = ref(false);
const mensajeImportarCatalogo = ref('');

const { data } = useAuth();
const token = data.value?.accessToken;
const responseOk = ref(false);
const servicioExternoCreado = ref(true);

async function importarCatalogoExterno() {
  mensajeImportarCatalogo.value = 'Los recursos seleccionados han sido importados';
  await navigateTo('/catalogo/cargar-servicios-remotos/cargados');
}

const opTipoFuente = [
  { id: 0, servicio: 'Servicio de Mapas Web', tipo: 'WMS' },
  { id: 1, servicio: 'Geonode (servicios de Mapas Web)', tipo: 'GN_WMS' },
  { id: 2, servicio: 'Servicio ArcGIS REST MapServer', tipo: 'REST_MAP' },
  { id: 3, servicio: 'Servcio ArcGIS REST ImageServer', tipo: 'REST_IMG' },
  { id: 4, servicio: 'El nuevo', tipo: 'FILE' },
];

async function crearCatalogoExterno() {
  // const { body } = await $fetch('/api/externo', {
  const response = await $fetch('/api/externo', {
    method: 'POST',
    // body: { url: campoURL.value, type: 'REST_MAP', token: token },
    body: { url: campoURL.value, type: selecTipoFuente.value, token: token },
  });
  // console.log('body', body);

  responseOk.value = true;
  if (response.ok) {
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
          <h2>Carga catálogos externos</h2>

          <form @keypress.enter.exact.prevent="conectarCatalogoExterno()">
            <ClientOnly class="flex">
              <SisdaiCampoBase
                v-model="campoURL"
                etiqueta="Servicio URL"
                ejemplo="URL de servicio externo"
                tipo="url"
              />
              <SisdaiSelector v-model="selecTipoFuente" etiqueta="Tipo de servicio" class="m-y-1">
                <option v-for="opcion in opTipoFuente" :key="opcion.id" :value="opcion.tipo">
                  {{ opcion.servicio }}
                </option>
              </SisdaiSelector>
            </ClientOnly>

            <div class="flex flex-contenido-inicio m-t-3">
              <button
                class="boton-primario"
                aria-label="Aplicar filtros"
                type="button"
                @click="crearCatalogoExterno()"
              >
                Crear conexión
              </button>
            </div>
          </form>
        </div>

        <div class="ancho-fijo">
          <h3>Título de servicio externo</h3>
          <p>Selecciona los recursos que quieres importar:</p>
          <form @keypress.enter.exact.prevent="importarCatalogoExterno()">
            <table class="tabla-condensada">
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

            <div class="flex flex-contenido-inicio m-t-3">
              <button
                class="boton-primario"
                aria-label="Aplicar filtros"
                type="button"
                @click="importarCatalogoExterno()"
              >
                Importar recursos
              </button>
            </div>
          </form>
          <!-- <p
            v-if="mensajeImportarCatalogo"
            class="texto-color-confirmacion fondo-color-confirmacion p-1 borde borde-color-confirmacion borde-redondeado-8"
            style="width: fit-content"
          >
            <span class="pictograma-aprobado"></span>{{ mensajeImportarCatalogo }}
          </p> -->
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
