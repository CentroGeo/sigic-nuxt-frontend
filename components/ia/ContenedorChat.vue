<script setup>
import { ref } from "vue";
const mensaje = ref("");
const sisdaiModal = ref(null);
// const cargando = ref("");

// get /api/resources/proyectos/chats
// const listaRecursos = [
//   {
//     proyectos: [
//       {
//         titulo: "Biodiversidad de ecosistemas marinos",
//         fuentes: [
//           // numero_fuentes
//           { titulo: "" },
//           {},
//         ],
//         contextos: [
//           // numero contextos
//           {
//             titulo: "Tecnologías para monitoreo marino",
//             chats: [
//               // numero chats
//               {
//                 id: 0,
//                 fecha: "2025-07-01T00:00:00", // date.slice(0,9):
//                 titulo:
//                   "Cobertura e integración de datos en el monitoreo marino",
//                 mensajes: [
//                   {
//                     actor: "AI",
//                     mensaje: "Hola, ¿En qué te puedo ayudar hoy?",
//                   },
//                   {
//                     actor: "Humano",
//                     mensaje: "Por favor, cuéntame una historia",
//                   },
//                   {
//                     actor: "AI",
//                     mensaje: "Era hace una vez...",
//                   },
//                 ],
//               },
//               {
//                 id: 1,
//                 fecha: "2025-06-01T00:00:00",
//                 titulo:
//                   "Análisis e integración de datos en el monitoreo marino",
//                 mensajes: [{ actor: "", mensaje: "" }],
//               },
//               {},
//             ],
//           },
//           {},
//         ],
//       },
//       {},
//     ],
//   },
// ];
// vistas url dinámicas

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
</script>
<template>
  <div>
    <!-- <div class="contenedor ancho-fijo"> -->
    <div>
      <!-- <div>
        showChatBar showDateIncorrect chatLog showChatLoader
        {{ message.message }}
      </div> -->

      <div class="grid">
        <div class="columna-2"></div>
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
                              : 'pictograma-ayuda'
                          "
                          style="
                            background-color: var(
                              --boton-primario-deshabilitado-fondo
                            );
                          "
                        />
                      </div>
                      <div>
                        <p
                          class="m-0"
                          :class="
                            m.actor == 'Humano'
                              ? 'fondo-color-confirmacion p-2 borde-redondeado-20'
                              : ''
                          "
                          :style="m.actor == 'Humano' ? 'max-width: 592px' : ''"
                        >
                          {{ m.message }}
                        </p>

                        <div v-if="m.actor == 'AI' && m.reporte" class="">
                          <p>
                            ¿Te gustaría que genere un reporte con esta
                            información o prefieres seguir consultando?
                          </p>
                          <div class="flex">
                            <!-- <SisdaiModal ref="sisdaiModal">
                              <template #encabezado>
                                <h1 class="m-t-0 texto-tamanio-6">
                                  <span
                                    class="pictograma-archivo-descargar p-l-0 p-t-0"
                                    aria-hidden="true"
                                  ></span
                                  >Descargar datos con más de una línea
                                </h1>
                              </template>

                              <template #cuerpo>
                                <div class="grid">
                                  <div class="columna-16">
                                    <p class="m-t-0">
                                      <b>Selección de datos</b>
                                    </p>
                                    <input
                                      id="radio1"
                                      type="radio"
                                      name="datos"
                                    />
                                    <label for="radio1">Todos los datos</label>
                                    <br />
                                    <input
                                      id="radio2"
                                      type="radio"
                                      name="datos"
                                    />
                                    <label for="radio2"
                                      >Mi selección de datos</label
                                    >

                                    <p><b>Formato de archivo</b></p>
                                    <input
                                      id="radio3"
                                      type="radio"
                                      name="archivo"
                                    />
                                    <label for="radio3"
                                      >.csv (Valores separados por comas)</label
                                    >
                                    <br />
                                    <input
                                      id="radio4"
                                      type="radio"
                                      name="archivo"
                                    />
                                    <label for="radio4"
                                      >.xls (Archivo de Excel)</label
                                    >
                                  </div>
                                </div>
                              </template>

                              <template #pie>
                                <button
                                  type="button"
                                  class="boton-primario"
                                  value="descarga"
                                  @click="descargaAlgo()"
                                >
                                  Descargar
                                </button>
                                <button
                                  type="button"
                                  class="boton-secundario"
                                  value="cancela"
                                  @click="sisdaiModal.cerrarModal()"
                                >
                                  Cancelar
                                </button>
                              </template>
                            </SisdaiModal> -->
                            <button
                              class="boton-primario boton-chico"
                              aria-label="Generar reporte"
                              type="button"
                              @click="sisdaiModal?.abrirModal()"
                            >
                              Generar reporte
                              <span
                                class="pictograma-documento"
                                aria-hidden="true"
                              ></span>
                            </button>

                            <button
                              class="boton-secundario boton-chico"
                              aria-label="Seguir consultando"
                              type="button"
                            >
                              Seguir consultando
                              <span
                                class="pictograma-actualizar"
                                aria-hidden="true"
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="contenedor-area-texto">
                <!-- <SisdaiCampoBase 
                  etiqueta="Campo de texto"
                  ejemplo="tipo text"
                  tipo="text"
                  v-model="ejemplo.texto"
                /> -->
                <!-- <label for="campo-idcreadoautomaticamente">
                  Nombre del campo
                  <span class="formulario-obligatoriedad"> (Obligatorio) </span>
                </label>
                <input
                  id="campo-idcreadoautomaticamente"
                  type="text"
                  placeholder="Muestra de ejemplo"
                  value=""
                  required
                /> -->
                <!-- <SisdaiAreaTexto 
                  etiqueta="Descripción"
                  v-model="ejemplo.descripcion"
                  texto_ayuda="Describe brevemente cómo llenar el campo."
                /> -->
                <!-- <form @submit.prevent> -->
                <form class="formulario-area-texto">
                  <label
                    for="area-idcreadoautomaticamente"
                    class="a11y-solo-lectura"
                  >
                    Nombre de la etiqueta
                  </label>
                  <textarea
                    @keypress.enter.exact.prevent="submitMensaje()"
                    tabindex="0"
                    id="area-idcreadoautomaticamente"
                    rows="1"
                    placeholder="Envía un mensaje"
                    v-model="mensaje"
                  />
                  <div class="formulario-boton">
                    <button
                      class="boton-pictograma boton-con-contenedor-primario"
                      aria-label="Enviar mensaje"
                      :disabled="mensaje == ''"
                      type="button"
                      @click.prevent="submitMensaje()"
                    >
                      <span
                        class="pictograma-flecha-arriba"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="columna-2"></div>
      </div>
    </div>
  </div>
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
