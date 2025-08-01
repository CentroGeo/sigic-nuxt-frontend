<script setup>
import SisdaiControlDeslizante from '@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue';
const controlDeslizante = ref(null);
const generaIdAleatorio = (el) => {
  return el + Math.random().toString(36).substring(2);
};
const idAleatorioControlDes = generaIdAleatorio('controldeslizante-');

const statusOk = ref(false);
const pending = ref(false);
async function guardarArchivo(formData) {
  const res = await fetch('/api/subirSLD', {
    method: 'POST',
    body: formData,
  });
  pending.value = true;
  // remover timeout
  setTimeout(() => {
    if (res.ok) {
      pending.value = false;
      statusOk.value = true;
    }
  }, '2500');
}
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h2 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex">
            <div class="columna-16">
              <h2>nombre de la capa.json</h2>
              <div class="flex">
                <nuxt-link to="/catalogo/mis-archivos/editar-metadatos" exact-path
                  >Metadatos</nuxt-link
                >
                <nuxt-link to="/catalogo/mis-archivos/editar-estilo">Estilo</nuxt-link>
              </div>
              <h2>Estilo</h2>
              <p><b>Estilo, solo archivos .sld</b></p>
              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  tipo-archivo-validos="sld"
                  @guardar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="statusOk">
                <!-- <div v-if="true"> -->
                <h2>Cargas recientes</h2>
                <div class="fondo-color-confirmacion p-3 borde-redondeado-16">
                  <div class="flex texto-color-confirmacion">
                    <span class="pictograma-aprobado" />
                    <b> Archivo cargado correctamente </b>
                  </div>

                  <p>Capas_lago_texcoco.json</p>

                  <div>
                    <nuxt-link to="/catalogo/mis-archivos">Ver en mis archivos</nuxt-link>
                  </div>
                </div>
              </div>
              <div v-if="pending">
                <h2>Cargas pendientes</h2>
                <div class="fondo-color-neutro p-3 borde-redondeado-16">
                  <div class="flex flex-contenido-separado">
                    <p class="flex-vertical-centrado">nombre de la capa.json</p>
                    <div class="flex">
                      <p class="borde borde-redondeado-8" style="padding: 4px">.sld</p>
                      <p class="flex-vertical-centrado">1MB</p>
                    </div>
                  </div>
                  <ClientOnly>
                    <SisdaiControlDeslizante
                      :id="idAleatorioControlDes"
                      ref="controlDeslizante"
                      :val_min="0"
                      :val_max="100"
                      :val_entrada="90"
                      step="10"
                      @blur="false"
                      @update:val_entrada="
                        ($event) => (controlDeslizante.valor_seleccionado = $event)
                      "
                    />
                  </ClientOnly>
                  <div class="flex flex-contenido-inicio">
                    <label :for="idAleatorioControlDes"
                      >{{
                        controlDeslizante?.valor_seleccionado < 100 ? 'Progreso' : 'Completado'
                      }}
                      {{ controlDeslizante?.valor_seleccionado }}%</label
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
