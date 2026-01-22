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
    proyectosPublicos: ref([
      /* {
        id: 1,
        nombre: 'Registro de arte urbano en la ciudad de Mérida, Yucatán',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 16,
      },
      {
        id: 2,
        nombre: 'Mapa de puntos de basura acumulada',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 16,
      },
      {
        id: 3,
        nombre: 'Registro de cruces peatonales peligrosos',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 33,
      },
      {
        id: 4,
        nombre: 'Censo de luminarias en la colonia Jardines del Horizonte',
        institucion: 'Nombre de institución',
        autor: 'Nombre de autoría',
        aportes: 121,
      }, */
    ]),
    descargasAprobadas: ref([]),
    existenDescargasAprobadas: ref(false),
    descargasEnRevision: ref([]),
    existenDescargasEnRevision: ref(false),

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
        this.proyectos.push(data.proyecto);
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

    obtenerProyectoPorId(id) {
      id = Number(id);

      return (
        this.proyectos.find((p) => p.id === id) ||
        this.proyectosPublicos.find((p) => p.id === id) ||
        null
      );
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
        this.existenProyectos = true;
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
  };
});
