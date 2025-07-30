<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiControlDeslizante from "@centrogeomx/sisdai-componentes/src/componentes/control-deslizante/SisdaiControlDeslizante.vue";
import { ref } from "vue";

const reporteModal = ref(null);
const controlDeslizante = ref(null);
const areaTextoRef = ref(null);

function enfocarAreaTexto() {
  areaTextoRef.value.focus();
}

const mensaje = ref("");
const mensajes = ref([
  {
    id: 0,
    actor: "AI",
    message: "Hola, ¿En qué te puedo ayudar hoy?",
    reporte: false,
  },
  {
    id: 1,
    actor: "Humano",
    // message: "Por favor, cuéntame una historia",
    message:
      "¿Cuáles serían los principales retos en el uso de estas tecnologías de monitoreo, considerando tanto la cobertura espacial como la integración de datos?",
    reporte: false,
  },
  {
    id: 2,
    actor: "AI",
    // message: "Era hace una vez...",
    message:
      "Hasta ahora hemos identificado que los principales retos en el uso de tecnologías para monitoreo marino están relacionados con la baja cobertura de sensores en áreas clave de biodiversidad, como el Arrecife Alacranes y la costa norte de Quintana Roo. También se ha detectado una limitada integración de datos entre plataformas locales e internacionales, lo cual dificulta el análisis comparativo y la toma de decisiones.",
    reporte: true,
  },
]);

const submitMensaje = () => {
  if (mensaje.value === "") return;
  mensajes.value.push({ actor: "Humano", message: mensaje.value });
  mensaje.value = "";
};
const generaIdAleatorio = (el) => {
  return el + Math.random().toString(36).substring(2);
};
const idAleatorio = generaIdAleatorio("areatexto-");
const idAleatorioCD = generaIdAleatorio("controldeslizante-");
</script>

<template>
  <div class="grid">
    <div class="columna-2"/>

    <div class="columna-12">
      <div class="contenedor-chat p-y-3">
        <div class="contenedor-chat-contenido">
          <div class="contenedor-log">
            <div v-for="m in mensajes" :key="m.id">
              <div :class="m.actor == 'Humano' ? 'p-y-2 ' : ''">
                <div
                  class="contenedor-log-contenido"
                  :style="
                    m.actor == 'Humano' ? 'flex-direction:row-reverse' : ''
                  "
                >
                  <div>
                    <span
                      class="pictograma-grande p-1 borde-redondeado-8"
                      :class="
                        m.actor == 'Humano'
                          ? 'pictograma-persona'
                          : 'pictograma-bot'
                      "
                      style="
                        background-color: var(
                          --boton-primario-deshabilitado-fondo
                        );
                      "
                    />
                  </div>
                  <div>
                    <!-- Mensaje chat -->
                    <p
                      class="m-0"
                      :class="
                        m.actor == 'Humano'
                          ? 'fondo-color-neutro p-2 borde-redondeado-20'
                          : ''
                      "
                      :style="m.actor == 'Humano' ? 'max-width: 592px' : ''"
                    >
                      {{ m.message }}
                    </p>

                    <!-- Reporte -->
                    <div v-if="m.actor == 'AI' && m.reporte" class="">
                      <p>
                        ¿Te gustaría que genere un reporte con esta información
                        o prefieres seguir consultando?
                      </p>
                      <div class="flex">
                        <!-- Abril modal -->
                        <button
                          class="boton-primario boton-chico"
                          aria-label="Generar reporte"
                          type="button"
                          @click="reporteModal?.abrirModal()"
                        >
                          Generar reporte
                          <span
                            class="pictograma-reporte"
                            aria-hidden="true"
                          />
                        </button>
                        <!-- Enfocar Area Texto -->
                        <button
                          class="boton-secundario boton-chico"
                          aria-label="Seguir consultando"
                          type="button"
                          @click="enfocarAreaTexto()"
                        >
                          Seguir consultando
                          <span
                            class="pictograma-actualizar"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="contenedor-area-texto">
            <form class="formulario-area-texto">
              <label :for="idAleatorio" class="a11y-solo-lectura">
                Nombre de la etiqueta
              </label>
              <textarea
                :id="idAleatorio"
                ref="areaTextoRef"
                v-model="mensaje"
                tabindex="0"
                rows="1"
                placeholder="Envía un mensaje"
                @keypress.enter.exact.prevent="submitMensaje()"
              />
              <div class="formulario-boton">
                <button
                  class="boton-pictograma boton-con-contenedor-primario"
                  aria-label="Enviar mensaje"
                  :disabled="mensaje == ''"
                  type="button"
                  @click.prevent="submitMensaje()"
                >
                  <span class="pictograma-flecha-arriba" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="columna-2"/>
  </div>
  <!-- Modal nuevo chat -->
  <ClientOnly>
    <SisdaiModal ref="reporteModal">
      <template #encabezado>
        <h2>
          {{
            controlDeslizante?.valor_seleccionado < 100
              ? "Creando reporte"
              : "Reporte listo"
          }}
        </h2>
      </template>

      <template #cuerpo>
        <div>
          <p v-if="controlDeslizante?.valor_seleccionado < 100">
            Tu archivo se está creando espera a que la barra de progreso se
            complete
          </p>
          <div
            v-if="controlDeslizante?.valor_seleccionado < 100"
            class="fondo-color-informacion p-x-2 p-y-1 borde borde-color-informacion borde-redondeado-20"
          >
            <p class="texto-color-informacion">
              <span class="pictograma-informacion"/>
              Verifica siempre los datos antes de usarlos.
            </p>
          </div>
          <div
            v-else-if="controlDeslizante?.valor_seleccionado == 100"
            class="fondo-color-confirmacion p-x-2 p-y-1 borde borde-color-confirmacion borde-redondeado-20"
          >
            <p class="texto-color-confirmacion">
              <span class="pictograma-aprobado"/>
              Tu reporte está listo para descagar
            </p>
          </div>
        </div>
        <div>
          <p>Creando reporte.pdf</p>
          <div>
            <ClientOnly>
              <SisdaiControlDeslizante
                :id="idAleatorioCD"
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
            <div class="flex flex-contenido-final">
              <label :for="idAleatorioCD"
                >{{
                  controlDeslizante?.valor_seleccionado < 100
                    ? "Progreso"
                    : "Completado"
                }}
                {{ controlDeslizante?.valor_seleccionado }}%</label
              >
            </div>
          </div>
        </div>
      </template>

      <template #pie>
        <button
          class="boton-primario boton-chico"
          aria-label="Descargar reporte"
          type="button"
          :disabled="controlDeslizante?.valor_seleccionado < 100"
        >
          Descargar reporte
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss">
.contenedor-chat {
  height: 85vh;
  .contenedor-chat-contenido {
    height: 100%;
    position: relative;
    .contenedor-log {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: calc(100% - 120px - 48px);
      overflow-y: auto;
      .contenedor-log-contenido {
        display: flex;
        gap: 24px;
      }
    }

    .contenedor-area-texto {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      form.formulario-area-texto {
        position: relative;
        width: 100%;
        .formulario-boton {
          position: absolute;
          bottom: 8px;
          right: 16px;
        }
      }
    }
  }
}
</style>
