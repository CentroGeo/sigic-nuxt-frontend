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
    esEdicionFormulario: ref(true),
    proyectosCompartidos: ref([]),
    esRevisor: ref(false),
    existenProyectosAprobados: ref(false),
    proyectosAprobados: ref([]),
    existenProyectosEnRevision: ref(false),
    proyectosEnRevision: ref([]),
    existenProyectosRechazados: ref(false),
    proyectosRechazados: ref([]),

    async obtenerProyectosPublicos() {
      try {
        const data = await $fetch(`${apiUrl}/projects/public`);
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

    async obtenerTotalDescargasEnRevision(user_id) {
      try {
        const response = await $fetch(`${apiUrl}/downloads/user/list`, {
          method: 'POST',
          body: {
            email: user_id,
            page: 1,
            limit: 10,
            status: 'NO REVISADO',
          },
        });

        this.descargasEnRevision = response;
        this.existenDescargasEnRevision = response?.descargas?.length > 0;

        console.log('lista descarga:', response);
        return response?.descargas?.length ?? 0;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    async eliminarDescargaEnRevision(id, usr) {
      try {
        const response = await $fetch(`${apiUrl}/downloads/user/${id}`, {
          method: 'DELETE',
          body: {
            id,
            email: usr,
          },
        });

        console.log('descarga eliminada:', response);
        return response;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async solicitarDescarga(formData) {
      try {
        const response = await $fetch(`${apiUrl}/downloads/owner/downloads`, {
          method: 'POST',
          body: {
            user_id: formData.get('user_id'),
            project_name: formData.get('project_name'),
            descriptionFileToExport: formData.get('descriptionFileToExport'),
            project_id: formData.get('project_id'),
          },
        });

        console.log(response);

        console.log('Descarga solicitada:', response);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
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

        if (!response.ok) {
          throw new Error('Error al actualizar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto actualizado:', data);
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
    async actualizarFormularioParticipantesProyecto(payload, idProyecto) {
      try {
        const response = await fetch(`${apiUrl}/projects/update/${idProyecto}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto enviado a aprobación:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async eliminarProyecto(userEmail, idProyecto) {
      try {
        const body = {
          user_id: userEmail,
        };

        const data = await $fetch(`${apiUrl}/projects/deactivate/${idProyecto}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        });
        console.log(data);
      } catch (err) {
        console.error('Error eliminando proyecto:', err);
      }
    },
    async obtenerProyectosCompartidos(email) {
      try {
        const body = {
          email: email,
        };

        const data = await $fetch(`${apiUrl}/projects/shared`, {
          method: 'POST',
          body: body,
        });
        console.log(data);
        this.proyectosCompartidos = data.proyectos;
      } catch (err) {
        console.error('Error cargando proyectos compartidos:', err);
      }
    },
    obtenerTotalProyectosCompartidos() {
      return this.proyectosCompartidos.length;
    },
    async obtenerEsRevisor(email) {
      try {
        const body = {
          email: email,
        };

        const data = await $fetch(`${apiUrl}/notifications/user/rol`, {
          method: 'POST',
          body: body,
        });

        console.log(data);
        this.esRevisor = data.is_reviewer;
      } catch (err) {
        console.error('Error cargando rol usuario:', err);
      }
    },
    obtenerTotalProyectosEnRevision() {
      return this.proyectosEnRevision.length;
    },
    async obtenerProyectosEnRevision(email) {
      try {
        const body = {
          email: email,
          status: 'EN REVISION',
        };

        const data = await $fetch(`${apiUrl}/projects/reviewer/list`, {
          method: 'POST',
          body: body,
        });

        this.proyectosEnRevision = data.proyectos;
        if (data.proyectos.length > 0) {
          this.existenProyectosEnRevision = true;
        }
      } catch (err) {
        console.error('Error obteniendo proyectos por status:', err);
      }
    },
    async obtenerProyectosRechazados() {
      const proyecto = {
        id: 1,
        nombre: 'Registro de arte urbano en la ciudad de Mérida, Yucatán',
        institucion: 'Dirección de Cultura',
        lider: 'Daniela Acuña',
      };

      this.proyectosRechazados.push(proyecto);
      this.existenProyectosRechazados = true;
    },
    async actualizarStatusProyecto(payload, idProyecto) {
      try {
        const response = await fetch(`${apiUrl}/projects/reviewer/status/${idProyecto}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto enviado a aprobación:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async obtenerProyectosAprobados(email) {
      try {
        const body = {
          email: email,
          status: 'APROBADO',
        };

        const data = await $fetch(`${apiUrl}/projects/reviewer/list`, {
          method: 'POST',
          body: body,
        });

        console.log(data);
        this.proyectosAprobados = data.proyectos;
        if (data.proyectos.length > 0) {
          this.existenProyectosAprobados = true;
        }
      } catch (err) {
        console.error('Error obteniendo proyectos por status:', err);
      }
    },
  };
});
