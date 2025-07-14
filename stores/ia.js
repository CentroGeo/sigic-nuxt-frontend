import { defineStore } from "pinia";
// TODO: intentar hacer un módulo para cada set proyectos,fuentes,contextos,chats
export const useIAStore = defineStore("ia", {
  state: () => ({
    existenProyectos: false,
    existeContexto: false,
    // chats: [
    //   {
    //     id: 0,
    //     titulo: "Cobertura e integración de datos en el monitoreo marino",
    //     titulo_proyecto: "Biodiversidad de ecosistemas marinos",
    //     titulo_contexto: "Tecnologías para monitoreo marino",
    //   },
    // ],
    // proyectos: [
    //   {
    //     id: 0,
    //     titulo: "Biodiversidad de ecosistemas marinos",
    //     numero_contextos: 0,
    //     numero_fuentes: 9,
    //   },
    //   // {
    //   //   id: 1,
    //   //   titulo: "Nombre del proyecto",
    //   //   numero_contextos: 5,
    //   //   numero_fuentes: 5,
    //   // },
    // ],
    // listadoChats: [
    //   {
    //     fecha: "01-07-2025",
    //     chat: [
    //       {
    //         id: 0,
    //         titulo: "Cobertura e integración de datos en el monitoreo marino",
    //         proyecto: "Biodiversidad de ecosistemas marinos",
    //         contexto: "Tecnologías para monitoreo marino",
    //       },
    //     ],
    //   },
    //   {
    //     fecha: "01-06-2025",
    //     chat: [
    //       {
    //         id: 1,
    //         titulo: "Análisis e integración de datos en el monitoreo marino",
    //         proyecto: "Biodiversidad de ecosistemas marinos",
    //         contexto: "Tecnologías para monitoreo marino",
    //       },
    //       {
    //         id: 2,
    //         titulo: "Diseño e integración de datos en el monitoreo marino",
    //         proyecto: "Biodiversidad de ecosistemas marinos",
    //         contexto: "Tecnologías para monitoreo marino",
    //       },
    //     ],
    //   },
    // ],
    listaRecursos: [
      {
        proyectos: [
          {
            id: 0,
            titulo: "Biodiversidad de ecosistemas marinos",
            fuentes: [
              // numero_fuentes
              { titulo: "" },
              {},
            ],
            contextos: [
              // numero contextos
              {
                id: 0,
                titulo: "Tecnologías para monitoreo marino",
                chats: [
                  // numero chats
                  {
                    id: 0,
                    fecha: "2025-07-01T00:00:00", // date.slice(0,9):
                    titulo:
                      "Cobertura e integración de datos en el monitoreo marino",
                    mensajes: [
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
                    ],
                  },
                  {
                    id: 1,
                    fecha: "2025-06-01T00:00:00",
                    titulo:
                      "Análisis e integración de datos en el monitoreo marino",
                    mensajes: [{ actor: "", mensaje: "" }],
                  },
                  {
                    id: 2,
                    fecha: "2025-06-01T00:00:00",
                    titulo:
                      "Diseño e integración de datos en el monitoreo marino",
                    mensajes: [{ actor: "", mensaje: "" }],
                  },
                  {},
                ],
              },
              {},
            ],
          },
          {},
        ],
      },
    ],
  }),
  actions: {
    crearProyecto() {
      this.existenProyectos = true;
    },
    crearContexto() {
      this.existeContexto = true;
    },
  },
});
