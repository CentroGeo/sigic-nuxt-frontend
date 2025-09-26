import { defineStore } from 'pinia';
// TODO: intentar hacer un módulo para cada set proyectos,fuentes,contextos,chats

export const useIAStore = defineStore('ia', {
  state: () => ({
    existenProyectos: false,
    existeContexto: false,
    proyectos: [],
    proyectoSeleccionado: null,
    fuentesProyecto: [],
    contextsProyecto: [],
    uploadProgress: 0,
    isUploading: false,
    chats: [],
    chatSeleccionado: null,
    contextoSeleccionado: null,
    backend: useRuntimeConfig().public.iaBackendUrl,
  }),
  getters: {
    authToken: () => {
      const { data } = useAuth();
      return data.value?.accessToken || null;
    },
  },
  actions: {
    async crearProyecto(title, description, isPublic, archivos = []) {
      console.log('crear proyecto');

      // Activar estado de subida
      this.isUploading = true;
      this.uploadProgress = 0;

      try {
        const formData = new FormData();

        // Datos básicos del proyecto
        formData.append('title', title);
        formData.append('description', description);
        //formData.append('visibility', visibilidadProyecto.value);
        formData.append('public', isPublic === 'publico' ? 'True' : 'False');

        console.log(archivos);

        // Agregar archivos si existen
        archivos.forEach((archivo) => {
          formData.append(`archivos`, archivo.archivo);
        });

        // Log para depuración
        for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        const token = this.authToken;

        // Usar XMLHttpRequest para monitorear progreso
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              this.uploadProgress = percent;
              console.log(`Progreso: ${percent}%`);
            }
          });

          xhr.addEventListener('load', () => {
            this.isUploading = false;
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              console.log('Proyecto guardado:', data);
              this.existenProyectos = true;
              resolve(data);
            } else {
              const error = JSON.parse(xhr.responseText)?.message || 'Error al guardar';
              reject(new Error(error));
            }
          });

          xhr.addEventListener('error', () => {
            this.isUploading = false;
            reject(new Error('Error de conexión'));
          });

          xhr.addEventListener('abort', () => {
            this.isUploading = false;
            reject(new Error('Subida cancelada'));
          });

          xhr.open('POST', this.backend + '/direct/api/fileuploads/workspaces/admin/create');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });
      } catch (error) {
        this.isUploading = false;
        console.error('Error:', error);
        throw error; // Re-lanzamos el error para manejarlo en el componente
      }
    },

    async crearContexto(formData) {
      const token = this.authToken;
      //this.existeContexto = true;

      console.log('crear crearContexto');
      try {
        /*         const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        //formData.append('visibility', visibilidadProyecto.value);
        formData.append("public", isPublic === "publico" ? "True" : "False");
 */

        const response = await fetch(
          this.backend + '/direct/api/fileuploads/workspaces/admin/contexts/create',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al guardar el contexto');
        }

        const data = await response.json();
        console.log('Contexto guardado:', data);

        // Redirigir después de guardar
        //this.existenProyectos = true;
        //navigateTo('/ia/proyectos');
      } catch (error) {
        console.error('Error:', error);
        throw error;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    },

    async getProjectsList() {
      //this.existeContexto = true;
      const token = this.authToken;

      const response = await fetch(this.backend + '/direct/api/fileuploads/workspaces/admin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Error al consultar proyectos');
      }

      const data = await response.json();
      this.proyectos = data;

      if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
        this.existenProyectos = true;
      } else {
        this.proyectoSeleccionado = null;
      }

      //console.log('Proyectos:', data);
      return data;
    },

    async getProjectSources(project_id) {
      const token = this.authToken;

      const response = await fetch(
        this.backend + '/direct/api/fileuploads/workspaces/admin/' + project_id + '/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Error al consultar fuentes de proyectos');
      }

      const data = await response.json();
      this.fuentesProyecto = data;

      /*    if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      }

      this.existenProyectos = true; */
      //console.log('Proyectos:', data);
      return data;
    },

    async getProjectContexts(project_id) {
      const token = this.authToken;
      const response = await fetch(
        this.backend + '/direct/api/fileuploads/workspaces/admin/' + project_id + '/contexts',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Error al consultar contextos');
      }

      const data = await response.json();
      this.contextosProyecto = data;

      this.existeContexto = true;

      /*    if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      }

      this.existenProyectos = true; */
      //console.log('Proyectos:', data);
      return data;
    },

    /**
     * Devuelve la lista de chats con fetch al backend
     * @param {Number} user_id
     * @returns {Array} data con los chats
     */
    async getChatList(user_id) {
      const token = this.authToken;
      //this.existeContexto = true;
      console.log(user_id);

      const response = await fetch(this.backend + '/direct/api/chat/history/getchats', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Error al consultar chats');
      }

      const data = await response.json();
      this.chats = data;

      /*       if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      } */
      //this.existenProyectos = true;
      //console.log('Proyectos:', data);
      return data;
    },

    async getChat(chat_id) {
      const token = this.authToken;
      //this.existeContexto = true;
      console.log(chat_id);

      const response = await fetch(this.backend + '/direct/api/chat/history/user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: parseInt(chat_id) }),
      });

      if (!response.ok) {
        throw new Error('Error al consultar chat');
      }

      const data = await response.json();
      console.log(data);
      //this.chats = data;

      /*       if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      } */

      //this.existenProyectos = true;
      //console.log('Proyectos:', data);
      return data;
    },

    seleccionarProyecto(proyecto) {
      //console.log("seleccionarProyecto: ",proyecto)
      this.proyectoSeleccionado = proyecto;
    },
    seleccionarContexto(contexto) {
      this.contextoSeleccionado = contexto;
    },
    async getProjectById(project_id) {
      const token = this.authToken;
      const response = await fetch(
        this.backend + `/direct/api/fileuploads/workspaces/admin/register/${project_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Error al consultar proyecto');
      }

      const data = await response.json();

      if (data && data.workspace) {
        const proyecto = {
          ...structuredClone(data.workspace),
          id: Number(project_id),
        };

        this.proyectoSeleccionado = proyecto;
      } else {
        this.proyectoSeleccionado = null;
      }

      return data;
    },
    async getContextById(project_id) {
      const token = this.authToken;
      const response = await fetch(
        this.backend + `/direct/api/fileuploads/workspaces/admin/contexts/register/${project_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Error al consultar proyecto');
      }

      const data = await response.json();

      if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      }

      return data;
    },
    async actualizarProyecto(
      title,
      description,
      isPublic,
      archivos,
      archivosEliminados,
      project_id
    ) {
      this.isUploading = true;
      this.uploadProgress = 0;

      try {
        const formData = new FormData();

        // Datos básicos del proyecto
        formData.append('title', title);
        formData.append('description', description);
        //formData.append('visibility', visibilidadProyecto.value);
        formData.append('public', isPublic === 'publico' ? 'True' : 'False');

        console.log(archivos);

        // Agregar archivos si existen
        archivos.forEach((archivo) => {
          formData.append('archivos', archivo.archivo);
        });

        if (archivosEliminados.length > 0) {
          formData.append('delete_files[]', archivosEliminados);
        }

        // Log para depuración
        /* for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        } */

        const token = this.authToken;

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              this.uploadProgress = percent;
            }
          });

          xhr.addEventListener('load', () => {
            this.isUploading = false;
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              console.log('Proyecto actualizado:', data);
              this.existenProyectos = true;
              resolve(data);
            } else {
              const error = JSON.parse(xhr.responseText)?.message || 'Error al guardar';
              reject(new Error(error));
            }
          });

          xhr.addEventListener('error', () => {
            this.isUploading = false;
            reject(new Error('Error de conexión'));
          });

          xhr.addEventListener('abort', () => {
            this.isUploading = false;
            reject(new Error('Subida cancelada'));
          });

          xhr.open(
            'POST',
            this.backend + `/direct/api/fileuploads/workspaces/admin/edit/${project_id}`
          );
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });
      } catch (error) {
        this.isUploading = false;
        console.error('Error:', error);
        throw error; // Re-lanzamos el error para manejarlo en el componente
      }
    },
    async actualizarContexto(formData, contexto_id) {
      try {
        const token = this.authToken;

        const response = await fetch(
          this.backend + `/direct/api/fileuploads/workspaces/admin/contexts/edit/${contexto_id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al actualizar el contexto');
        }

        const data = await response.json();
        console.log('Contexto actualizado:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async eliminarProyecto(project_id) {
      try {
        const token = this.authToken;

        const response = await fetch(
          this.backend + `/direct/api/fileuploads/workspaces/admin/delete/${project_id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al eliminar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto eliminado:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async eliminarContexto(contexto_id) {
      try {
        const token = this.authToken;

        const response = await fetch(
          this.backend + `/direct/api/fileuploads/workspaces/admin/contexts/delete/${contexto_id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error('Error al eliminar el contexto');
        }

        const data = await response.json();
        console.log('Contexto eliminado:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
  },
});
