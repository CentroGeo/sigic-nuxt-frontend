<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const selecTipoFuente = ref('');
const campoURL = ref('');
const responseOk = ref(false);
const opTipoFuente = [
  { id: 0, servicio: 'Servicio de Mapas Web', tipo: 'WMS' },
  { id: 1, servicio: 'Geonode (servicios de Mapas Web)', tipo: 'GN_WMS' },
  { id: 2, servicio: 'Servicio ArcGIS REST MapServer', tipo: 'REST_MAP' },
  { id: 3, servicio: 'Servcio ArcGIS REST ImageServer', tipo: 'REST_IMG' },
  { id: 4, servicio: 'El nuevo', tipo: 'FILE' },
];

function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      title: 'v.title',
      unique_identifier: 'v.unique_identifier',
      remote_resource_type: 'v.remote_resource_type',
    },
  });
}

async function crearConexion() {
  // const { data } = useAuth();
  // const token = data.value?.accessToken;
  if (campoURL.value && selecTipoFuente.value) {
    const { body } = await $fetch('/api/externo', {
      // const response = await $fetch('/api/externo', {
      method: 'POST',
      // body: { url: campoURL.value, type: 'REST_MAP', token: token },
      // body: { url: campoURL.value, type: selecTipoFuente.value, token: token },
      body: { url: campoURL.value, type: selecTipoFuente.value },
    });
    // console.log('response', response);
    console.warn('body', body);
    responseOk.value = true;
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
          <form @submit.prevent>
            <ClientOnly class="flex">
              <SisdaiCampoBase
                v-model="campoURL"
                etiqueta="Servicio URL"
                ejemplo="URL de servicio externo"
                :es_obligatorio="true"
                tipo="url"
              />
              <SisdaiSelector
                v-model="selecTipoFuente"
                class="m-y-1"
                etiqueta="Tipo de servicio"
                :es_obligatorio="true"
              >
                <option v-for="opcion in opTipoFuente" :key="opcion.id" :value="opcion.tipo">
                  {{ opcion.servicio }}
                </option>
              </SisdaiSelector>
            </ClientOnly>
            <div class="flex flex-contenido-inicio m-t-3">
              <button
                class="boton-primario"
                aria-label="Crear conexión de catálogo externo"
                type="button"
                @click="crearConexion()"
              >
                Crear conexión
              </button>
            </div>
          </form>
        </div>
        <div v-if="responseOk">
          <p
            class="flex flex-contenido-separado texto-color-confirmacion fondo-color-confirmacion p-1 borde borde-color-confirmacion borde-redondeado-8"
          >
            <span> <span class="pictograma-aprobado" />La conexión remota tuvo éxito </span>
            <nuxt-link @click="irAImportarRecursos">Ir a importar recursos</nuxt-link>
          </p>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
