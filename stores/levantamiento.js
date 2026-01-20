import { defineStore } from 'pinia';

export const useLevantamientoStore = defineStore('levantamiento', () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.levantamientoBackendUrl;

  return {
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    existenProyectos: ref(false),
    participantes: ref([]),
    existenParticipantes: ref(false),
    existeFormulario: ref(false),
    proyectos: ref([]),
    proyectosPublicos: ref([]),
    descargasAprobadas: ref([]),
    existenDescargasAprobadas: ref(false),
    descargasEnRevision: ref([]),
    existenDescargasEnRevision: ref(false),

    async obtenerProyectosPublicos() {
      try {
        const data = await $fetch(`${apiUrl}/projects/public`);
        console.log(data);
        this.proyectosPublicos = data.proyectos;
      } catch (err) {
        console.error('Error cargando proyectos:', err);
      }
    },

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },

    alternarParticipantes() {
      this.existenParticipantes = !this.existenParticipantes;
    },

    alternarFormulario() {
      this.existeFormulario = !this.existeFormulario;
    },

    async guardarProyecto(formData) {
      try {
        const response = await fetch(`${apiUrl}/projects/create`, {
          method: 'POST',
          body: formData,
        });

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al guardar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto guardado:', data);

        const proyectoConAportaciones = {
          ...data.proyecto,
          num_aportaciones: '0',
        };

        this.proyectos.unshift(proyectoConAportaciones);
        this.existenProyectos = true;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    obtenerTotalProyectos() {
      return this.proyectos.length;
    },

    obtenerTotalProyectosPublicos() {
      return this.proyectosPublicos.length;
    },

    async obtenerProyectoPorId(email, id) {
      try {
        const body = {
          email: email,
        };

        const data = await $fetch(`${apiUrl}/projects/register/${id}`, {
          method: 'POST',
          body: body,
        });

        /* console.log(data.proyectos[0]); */
        return data.proyectos[0];
      } catch (err) {
        console.error('Error cargando proyecto:', err);
      }
    },
    obtenerTotalDescargasAprobadas() {
      return this.descargasAprobadas.length;
    },
    obtenerTotalDescargasEnRevision() {
      return this.descargasEnRevision.length;
    },
    solicitarDescarga() {
      const descarga = {
        id: this.descargasEnRevision.length + 1,
        nombre_proyecto: 'Registro de arte urbano en la Ciudad de Mérida, Yucatán (2025)',
        solicitante: 'Daniela Acuña',
        formato: '.gpkg',
        fecha_solicitud: '12/11/25',
      };

      this.descargasEnRevision.push(descarga);
      this.existenDescargasEnRevision = true;
    },
    async obtenerMisProyectos(email) {
      try {
        const body = {
          email: email,
        };

        const data = await $fetch(`${apiUrl}/projects/own`, {
          method: 'POST',
          body: body,
        });
        console.log(data);
        this.proyectos = data.proyectos;
        if (data.proyectos.length > 0) {
          this.existenProyectos = true;
        }
      } catch (err) {
        console.error('Error cargando proyectos:', err);
      }
    },
    async actualizarProyecto(formData, idProyecto) {
      try {
        const response = await fetch(`${apiUrl}/projects/update/${idProyecto}`, {
          method: 'PUT',
          body: formData,
        });

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al actualizar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto guardado:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async obtenerParticipantesPorProyecto(email, idProyecto) {
      try {
        const body = {
          user_id: email,
        };

        const data = await $fetch(`${apiUrl}/projects/shared/${idProyecto}/user/list`, {
          method: 'POST',
          body: body,
        });
        console.log(data);
        this.participantes = data.usuarios;
        if (data.usuarios.length > 0) {
          this.existenParticipantes = true;
        }
      } catch (err) {
        console.error('Error cargando participantes:', err);
      }
    },
    async agregarParticipanteProyecto(userEmail, email, rol, idProyecto) {
      try {
        const body = {
          user_id: userEmail,
          email: email,
          rol: rol,
        };

        const data = await $fetch(`${apiUrl}/projects/shared/${idProyecto}/user/add`, {
          method: 'POST',
          body: body,
        });
        console.log(data);
      } catch (err) {
        console.error('Error guardando participante:', err);
      }
    },
    async actualizarParticipanteProyecto(userEmail, rol, idProyecto, idParticipante) {
      try {
        const body = {
          user_id: userEmail,
          rol: rol,
        };

        const data = await $fetch(
          `${apiUrl}/projects/shared/${idProyecto}/user/${idParticipante}/update`,
          {
            method: 'POST',
            body: body,
          }
        );
        console.log(data);
      } catch (err) {
        console.error('Error actualizando participante:', err);
      }
    },
    async eliminarParticipanteProyecto(userEmail, idProyecto, idParticipante) {
      try {
        const body = {
          user_id: userEmail,
        };

        const data = await $fetch(
          `${apiUrl}/projects/shared/${idProyecto}/user/${idParticipante}/remove`,
          {
            method: 'DELETE',
            body: body,
          }
        );
        console.log(data);
      } catch (err) {
        console.error('Error eliminando participante:', err);
      }
    },
  };
});
