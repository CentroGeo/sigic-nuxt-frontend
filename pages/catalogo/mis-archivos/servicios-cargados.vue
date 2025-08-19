<script setup>
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
        <h2>Carga catálogos externos</h2>

        <div class="ancho-fijo">
          <h3>Recursos cargados</h3>
          <form @keypress.enter.exact.prevent="agregarServicioRemoto()">
            <table>
              <!-- <caption>
                Nombre del servicio
              </caption> -->
              <thead>
                <tr>
                  <th>Nombre de servicio externo</th>
                  <th>Recursos exportados</th>
                  <th>Recursos pendientes</th>
                  <th>URL</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nombre de servicio externo</td>
                  <td><a href="#">1</a></td>
                  <td><a href="#">3</a></td>
                  <td>https://</td>
                  <td>ArcGIS REST MapServer</td>
                </tr>
              </tbody>
            </table>
            <div class="flex flex-contenido-inicio m-t-3">
              <nuxt-link
                class="boton boton-primario"
                aria-label="Ir a catálogo externo en mis archivos"
                to="/catalogo/mis-archivos"
                >Ver catálogo Externo en Mis Archivos</nuxt-link
              >
              <nuxt-link
                class="boton boton-secundario"
                aria-label="Agregar servicio remoto"
                to="/catalogo/mis-archivos/servicios-externos"
                >Agregar servicio remoto</nuxt-link
              >
            </div>
          </form>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
