<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

// import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const router = useRouter();
const route = useRoute();

const title = computed(() => route.query.title);
const previous_path = computed(() => route.query.previous_path);

const tipoObraBotonRadio = ref('mural');
const estadoConservacionBotonRadio = ref('bueno');
const autorCampoBase = ref('');
const observacionesCampoBase = ref('');
const imagenAporte = ref(null);
const imagenPreview = ref(null);

/**
 * Guardar y asignar un archivo de imagen al aporte
 * @param archivo de imagen que se guarda
 */
async function guardarArchivo(archivo) {
  imagenAporte.value = archivo;
}

const editarUbicaAporte = ref(true);

const rutaAnterior = ref('');
/**
 * Obtiene la ruta anterior y la procesa para devolver
 * @returns {String} con el nombre de la vista anterior
 */
function obtenerRutaAnterior() {
  // se divide la ruta por / y se toma el tercer índice
  rutaAnterior.value = route.query.previous_path.split('/', 4)[3];
  if (rutaAnterior.value === undefined) {
    // si es indefinido no tiene tercer índice
    return 'aprobados';
  } else {
    if (rutaAnterior.value === 'en-revision') {
      return 'en revisión';
    } else {
      return rutaAnterior.value.replace('-', ' ');
    }
  }
}
const modalRegresar = ref(null);
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="m-t-4">
        <div class="contenedor">
          <div class="flex">
            <nuxt-link aria-label="Regresar a aportes" @click="modalRegresar.abrirModal()">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento m-r-2"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario">Aportes {{ obtenerRutaAnterior() }}</span>
            </nuxt-link>
          </div>
          <h2>Editando aporte en:</h2>
          <h3>{{ title }}</h3>
        </div>
        <hr />

        <div v-if="editarUbicaAporte" class="contenedor m-b-1">
          <div class="flex m-t-3">
            <div class="columna-5">
              <h4 class="m-t-0">1. Ubica tu aporte</h4>
              <p>
                Usa tu ubicación actual, escribe un lugar en el buscador o selecciona un punto en el
                mapa.
              </p>
              <button class="boton-primario" type="button" @click="editarUbicaAporte = false">
                Siguiente
              </button>
            </div>
            <div class="columna-11">
              <ClientOnly>
                <SisdaiMapa
                  id="aportesmapa"
                  class="gema"
                  style="height: 60vh; width: 100%"
                  descripcion="Este mapa permite seleccionar una ubicación y buscar un lugar en el buscador"
                  :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
                >
                  <SisdaiCapaXyz />
                </SisdaiMapa>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div v-if="!editarUbicaAporte" class="contenedor m-b-3" style="overflow-y: hidden">
          <div class="flex m-t-3">
            <div class="columna-5">
              <h4 class="m-t-0">2. Completa el formulario</h4>
              <p>Completa la información solicitada relacionada con tu aporte.</p>
              <button class="boton-secundario" type="button" @click="editarUbicaAporte = true">
                Regresar
              </button>
            </div>
            <div
              class="columna-11 fondo-color-acento borde-redondeado-16"
              style="height: 60vh; overflow-y: auto"
            >
              <ol class="lista-sin-estilo m-3">
                <li class="fondo-color-primario borde-redondeado-16 p-3">
                  <p>1. Tipo de obra artística</p>
                  <label class="p-b-3">
                    Selecciona la opción que mejor describa el tipo de obra artística
                  </label>
                  <hr class="m-b-3" />
                  <ClientOnly>
                    <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true" :es_obligatorio="true">
                      <SisdaiBotonRadio
                        v-model="tipoObraBotonRadio"
                        etiqueta="Mural"
                        value="mural"
                        name="tipodeobraartistica"
                        :es_obligatorio="true"
                      />
                      <SisdaiBotonRadio
                        v-model="tipoObraBotonRadio"
                        etiqueta="Escultura"
                        value="escultura"
                        name="tipodeobraartistica"
                        :es_obligatorio="true"
                      />
                      <SisdaiBotonRadio
                        v-model="tipoObraBotonRadio"
                        etiqueta="Instalación temporal"
                        value="instalacion"
                        name="tipodeobraartistica"
                        :es_obligatorio="true"
                      />
                    </SisdaiBotonesRadioGrupo>
                  </ClientOnly>
                </li>
                <li class="fondo-color-primario borde-redondeado-16 p-3">
                  <p>2. Estado de conservación</p>
                  <label class="p-b-3">
                    Especifica el estado de conservación de la obra artística
                  </label>
                  <hr class="m-b-3" />
                  <ClientOnly>
                    <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true" :es_obligatorio="true">
                      <SisdaiBotonRadio
                        v-model="estadoConservacionBotonRadio"
                        etiqueta="Bueno (colores vivos, sin daños visibles)"
                        value="bueno"
                        name="estadodeconservacion"
                        :es_obligatorio="true"
                      />
                      <SisdaiBotonRadio
                        v-model="estadoConservacionBotonRadio"
                        etiqueta="Regular (algunos daños, desgaste por clima)"
                        value="regular"
                        name="estadodeconservacion"
                        :es_obligatorio="true"
                      />
                      <SisdaiBotonRadio
                        v-model="estadoConservacionBotonRadio"
                        etiqueta="Deteriorado (despintado, vandalizado, apenas visible)"
                        value="deteriorado"
                        name="estadodeconservacion"
                        :es_obligatorio="true"
                      />
                    </SisdaiBotonesRadioGrupo>
                  </ClientOnly>
                </li>
                <li class="fondo-color-primario borde-redondeado-16 p-3">
                  <p>3. Autor o colectivo</p>
                  <label class="p-b-1">
                    Escribe el nombre del autor o colectivo de la obra artística
                  </label>
                  <ClientOnly>
                    <SisdaiCampoBase
                      v-model="autorCampoBase"
                      etiqueta="Autor o colectivo"
                      ejemplo="Colectivo Arte Urbano"
                      :es_obligatorio="true"
                      :es_etiqueta_visible="false"
                    />
                  </ClientOnly>
                </li>
                <li class="fondo-color-primario borde-redondeado-16 p-3">
                  <p>4. Observaciones adicionales</p>
                  <ClientOnly>
                    <SisdaiCampoBase
                      v-model="observacionesCampoBase"
                      etiqueta="Observaciones adicionales"
                      ejemplo="El mural representa la vida cotidiana del barrio, con escena de merca..."
                      :es_obligatorio="true"
                      :es_etiqueta_visible="false"
                    />
                  </ClientOnly>
                </li>
                <li class="fondo-color-primario borde-redondeado-16 p-3">
                  5. Agrega fotografías
                  <label class="p-y-2">
                    Adjunta hasta cuatro fotos donde se aprecie claramente la obra artística
                    (Formatos permitidos: JPG, PNG, máximo 5 MB)
                  </label>
                  <IaElementoDragNdDrop
                    ref="dragNdDrop"
                    :imagen-inicial="imagenPreview"
                    @pasar-archivo="(i) => guardarArchivo(i)"
                  />
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalRegresar">
          <template #encabezado> <h2>Guardar cambios</h2> </template>
          <template #cuerpo>
            <p>¿Deseas guardar los cambios realizados en tu aporte y enviar de nuevo a revisión?</p>
          </template>
          <template #pie>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="router.push(previous_path)"
            >
              Regresar sin guardar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped></style>
