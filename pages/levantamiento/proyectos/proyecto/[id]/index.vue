<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const storeLevantamiento = useLevantamientoStore();
const { data } = useAuth();
const proyecto = ref(null);

watch(
  () => data.value?.user.email,
  async (email) => {
    if (!email) return;

    proyecto.value = await storeLevantamiento.obtenerProyectoPorId(email, route.params.id);
  },
  { immediate: true }
);

const preguntas = computed(() => {
  const ficha = proyecto.value?.ficha_proyecto;

  return Array.isArray(ficha) ? ficha : [];
});

const modalSolicitarDescarga = ref(null);
const modalDescargaSolicitada = ref(null);

function irAProyectosPublicos() {
  router.push('/levantamiento/proyectos/');
}

const handleDescarga = () => {
  modalSolicitarDescarga.value.cerrarModal();
  modalDescargaSolicitada.value.abrirModal();
};
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="mis-proyectos-levantamiento contenedor m-b-10 m-t-3">
        <div class="grid m-b-3">
          <div class="columna-16 flex regresar mis-proyectos-encabezado">
            <div class="boton-regresar">
              <button
                class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
                aria-label="Regresar a proyectos"
                type="button"
                @click="irAProyectosPublicos"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Proyectos públicos
            </div>
          </div>
        </div>
        <h3 class="m-t-0 m-b-1">{{ proyecto?.nombre }}</h3>
        <div class="flex proyecto-encabezado texto-color-secundario m-b-3">
          <div
            class="p-x-1 p-y-minimo borde-redondeado-8 borde borde-color-acento fondo-color-acento"
          >
            Arte y cultura
          </div>
          <UiNumeroElementos :numero="proyecto?.num_aportaciones" etiqueta="Aportes" />
          <div>{{ proyecto?.institucion }}</div>
          <div>{{ proyecto?.lider }}</div>
        </div>
        <div class="contenedor">
          <div class="grid contenedor-formulario">
            <div class="columna-8 preguntas">
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Objetivo del proyecto:</h5>
                <p class="m-y-0">
                  {{ proyecto?.objetivo }}
                </p>
              </div>
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Instrucciones clave del formulario:</h5>
                <p class="m-y-0">
                  {{ proyecto?.instrucciones }}
                </p>
              </div>
              <div class="m-b-3">
                <h5 class="m-t-0 m-b-2">Visualización de formulario</h5>
                <div class="fondo-color-neutro p-3 borde-redondeado-20 flex">
                  <div
                    v-for="(pregunta, index) in preguntas"
                    :key="index"
                    class="p-3 borde-redondeado-20 fondo-color-primario columna-16"
                  >
                    <div class="m-b-2 texto-peso-500">
                      {{ index + 1 }}.
                      {{
                        pregunta.tipo !== 'multimedia' ? pregunta.pregunta : 'Agrega fotografías'
                      }}
                    </div>
                    <div class="m-b-1 texto-color-secundario texto-peso-500">
                      {{ pregunta.instrucciones }}
                    </div>

                    <div
                      v-if="pregunta.obligatorio"
                      class="texto-color-secundario texto-tamanio-2 text-peso-400"
                    >
                      Obligatoria*
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="columna-8 mapa">
              <ClientOnly>
                <SisdaiMapa
                  id="aportesmapa"
                  class="gema"
                  descripcion="Este mapa permite solicitar una descarga y crear un aporte"
                  :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
                >
                  <SisdaiCapaXyz />
                </SisdaiMapa>
              </ClientOnly>
              <div class="flex acciones-mapa">
                <button
                  class="boton-primario boton-chico"
                  @click="modalSolicitarDescarga.abrirModal()"
                >
                  Solicitar descarga
                  <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
                </button>
                <NuxtLink
                  class="boton boton-primario boton-chico boton-accion-aportar"
                  aria-label="Aportar"
                  :to="`/levantamiento/proyectos/proyecto/${proyecto?.id}/aportar`"
                >
                  Aportar
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <ClientOnly>
          <SisdaiModal ref="modalSolicitarDescarga">
            <template #encabezado><h3>Descargar datos</h3></template>
            <template #cuerpo>
              <SisdaiAreaTexto
                etiqueta="Describe el uso que le darás a los datos"
                ejemplo="Describe el uso que le darás a los datos..."
                :es_etiqueta_visible="true"
                :es_obligatorio="false"
                class="m-b-3"
              />
              <p class="m-t-0 m-b-3">
                Selecciona el formato en el cual deseas descargar los datos:
              </p>
              <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  etiqueta="Tabulado de datos .csv"
                  value="csv"
                  name="modo-descarga"
                />
                <SisdaiBotonRadio
                  etiqueta="Geopaquete .gpkg"
                  value="geopaquete"
                  name="modo-descarga"
                />
              </SisdaiBotonesRadioGrupo>
            </template>
            <template #pie>
              <button
                type="button"
                class="boton-secundario boton-chico"
                @click="modalSolicitarDescarga?.cerrarModal()"
              >
                Cerrar
              </button>
              <button type="button" class="boton-primario boton-chico" @click="handleDescarga">
                Solicitar descarga
              </button>
            </template>
          </SisdaiModal>

          <SisdaiModal ref="modalDescargaSolicitada">
            <template #encabezado><h3>Descarga solicitada</h3></template>
            <template #cuerpo>
              <div
                class="texto-color-confirmacion fondo-color-confirmacion borde-redondeado-20 borde borde-color-confirmacion p-3 m-b-3"
              >
                <div class="m-0 descarga-notificacion">
                  <span class="pictograma-aprobado"></span>
                  <div>
                    Tu solicitud se ha procesado con éxito, puedes darle seguimiento en la sección
                    “Descargas”.
                  </div>
                </div>
              </div>
            </template>
            <template #pie>
              <button
                type="button"
                class="boton-secundario boton-chico"
                @click="modalDescargaSolicitada?.cerrarModal()"
              >
                Cerrar
              </button>
              <nuxt-link class="boton boton-primario boton-chico" to="/levantamiento/descargas">
                Ir a Descargas
              </nuxt-link>
            </template>
          </SisdaiModal>
        </ClientOnly>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style scoped lang="scss">
.regresar {
  &.mis-proyectos-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;

    .boton-regresar {
      display: flex;
      align-items: center;
      font-size: var(--Tipos-Tamao-Prrafos-Texto-alto, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: var(--Tipos-Interlineado-Prrafos-Texto-alto, 30px);
    }
  }
}

.menu-proyectos {
  flex: 1;
}
.boton-guardar-cambios-proyecto {
  align-self: center;
}

.mis-proyectos-levantamiento {
  display: flex;
  flex-direction: column;
}

.mis-proyectos-contenedor {
  flex: 1;
}

.proyecto-encabezado {
  align-items: center;
}

.texto-peso-500 {
  font-weight: 500;
}

.texto-peso-400 {
  font-weight: 400;
}

.contenedor-formulario {
  height: 60vh;
  overflow: hidden;

  .columna-8.preguntas {
    overflow: auto;
  }

  .columna-8.mapa {
    height: 100%;
    position: relative;

    .acciones-mapa {
      position: absolute;
      bottom: 24px;
      right: 26px;

      .boton-accion-aportar {
        width: 143px;
        justify-content: center;
      }
    }
  }
}

.descarga-notificacion {
  display: flex;
  align-items: center;

  span {
    margin-right: 10px;
  }
}
</style>
