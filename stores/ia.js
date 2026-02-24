import { defineStore } from 'pinia';

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
    chatActual: null,
    contextoSeleccionado: null,
    backend: useRuntimeConfig().public.iaBackendUrl,
    chatsVersion: 0,
    projectsVersion: 0,
  }),
  getters: {
    authToken: () => {
      const { data } = useAuth();
      return data.value?.accessToken || null;
    },
    userEmail: () => {
      const { data } = useAuth();
      return data.value?.user.email || null;
    },
  },
  actions: {
    async crearProyecto(title, description, isPublic, archivos = [], archivosGeonode = []) {
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

        console.log('archivos:', archivos);

        // Agregar archivos si existen
        archivos.forEach((archivo) => {
          formData.append(`archivos`, archivo.archivo);
        });
        // agregar archivos cuando son de geonode
        archivosGeonode.forEach((archivo) => {
          formData.append(
            'archivos_geonode',
            JSON.stringify({ id: archivo.pk, category: archivo.category, nombre: archivo.nombre })
          );
        });

        // Log para depuración
        for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        const token = this.authToken;

        const userEmail = this.userEmail;

        formData.append('user_id', userEmail);

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
              console.log('Proyecto guardado correctamente:', data);
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

          xhr.open('POST', this.backend + '/api/fileuploads/workspaces/admin/create');
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
      console.log('crear contexto');

      const token = this.authToken;
      const userEmail = this.userEmail;
      formData.append('user_id', userEmail);

      // Log para depuración
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      try {
        const response = await fetch(
          this.backend + '/api/fileuploads/workspaces/admin/contexts/create',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        // console.log(response);

        if (!response.ok) {
          throw new Error('Error al guardar el contexto');
        }

        const data = await response.json();
        console.log('Contexto guardado exitosamente:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    },

    /**
     * Obtiene la lista de proyectos guardados por user_id
     * y selecciona un proyecto si la lista no está vacía
     * @returns {Array}
     */
    async getProjectsList() {
      const token = this.authToken;
      const userEmail = this.userEmail;

      const formData = new FormData();
      formData.append('user_id', userEmail);

      const response = await fetch(this.backend + '/api/fileuploads/workspaces/admin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al consultar proyectos');
      }
      const data = await response.json();

      // Para que el último sea siempre el primero
      this.data = data.reverse();

      // asigna data a proyectos
      this.proyectos = data;

      // si data es mayor a cero selecciona el primer proyecto de la lista
      if (data.length > 0) {
        // console.log('this.proyectoSeleccionado', this.proyectoSeleccionado);
        if (this.proyectoSeleccionado !== null) {
          // eslint-disable-next-line no-self-assign
          this.proyectoSeleccionado = this.proyectoSeleccionado;
        } else {
          this.proyectoSeleccionado = data[0];
        }

        this.existenProyectos = true;
      } else {
        this.proyectoSeleccionado = null;
        this.existenProyectos = false;
      }

      return data;
    },

    async getProjectSources(project_id) {
      const token = this.authToken;

      const response = await fetch(
        this.backend + `/api/fileuploads/workspaces/admin/${project_id}/files`,
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

      const userEmail = this.userEmail;

      const formData = new FormData();
      formData.append('user_id', userEmail);

      const response = await fetch(
        this.backend + '/api/fileuploads/workspaces/admin/' + project_id + '/contexts',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al consultar contextos');
      }

      const data = await response.json();
      this.contextosProyecto = data;

      // this.existeContexto = true;

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
    async getChatList() {
      const token = this.authToken;
      const userEmail = this.userEmail;
      const formData = new FormData();
      formData.append('user_id', userEmail);

      const response = await fetch(this.backend + '/api/chat/history/getchats', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al consultar chats');
      }

      const data = await response.json();
      this.chats = data;
      console.log('Chats:', this.chats);
      return data;
    },

    async getChat(chat_id) {
      const token = this.authToken;
      //this.existeContexto = true;
      console.log('chat_id', chat_id);

      const response = await fetch(this.backend + '/api/chat/history/user', {
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
      // console.log(data);
      console.log('openChat: ', data);
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
        this.backend + `/api/fileuploads/workspaces/admin/register/${project_id}`,
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
        this.backend + `/api/fileuploads/workspaces/admin/contexts/register/${project_id}`,
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
      project_id,
      archivosGeonode
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

        // console.log('archivos', archivos);
        // console.log('archivosGeonode', archivosGeonode);

        // Agregar archivos si existen
        archivos.forEach((archivo) => {
          formData.append('archivos', archivo.archivo);
        });
        // agregar archivos cuando son de geonode
        archivosGeonode.forEach((archivo) => {
          formData.append(
            'archivos_geonode',
            JSON.stringify({ id: archivo.pk, category: archivo.category, nombre: archivo.nombre })
          );
        });
        // console.log('formData', formData);

        if (archivosEliminados.length > 0) {
          archivosEliminados.forEach((element) => {
            formData.append('delete_files[]', element);
          });
        }

        // Log para depuración
        /* for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        } */

        const token = this.authToken;

        const userEmail = this.userEmail;

        formData.append('user_id', userEmail);

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

          xhr.open('POST', this.backend + `/api/fileuploads/workspaces/admin/edit/${project_id}`);
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
        const userEmail = this.userEmail;
        formData.append('user_id', userEmail);

        // imprime lo que va en el formData
        for (const pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await fetch(
          this.backend + `/api/fileuploads/workspaces/admin/contexts/edit/${contexto_id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        // console.log(response);

        if (!response.ok) {
          throw new Error('Error al actualizar el contexto');
        }

        const data = await response.json();
        console.log('Contexto actualizado exitosamente:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    async eliminarProyecto(project_id) {
      try {
        const token = this.authToken;

        const response = await fetch(
          this.backend + `/api/fileuploads/workspaces/admin/delete/${project_id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response);

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
          this.backend + `/api/fileuploads/workspaces/admin/contexts/delete/${contexto_id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response);

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
    async updateChat(title, chat_id) {
      const token = this.authToken;

      const response = await fetch(this.backend + '/api/chat/history/title', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, chat_id: parseInt(chat_id) }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar chat');
      }

      const data = await response.json();
      console.log('Chat actualizado:', data);

      return data;
    },
    async deleteChat(chat_id) {
      try {
        const token = this.authToken;

        const response = await fetch(this.backend + `/api/chat/history/remove/${chat_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el chat');
        }

        const data = await response.json();
        console.log('Chat eliminado:', data);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    triggerChatsReload() {
      this.chatsVersion++;
    },
    setChatActual(chat) {
      this.chatActual = chat;
    },
    clearChatActual() {
      this.chatActual = null;
    },
    triggerProjectReload() {
      this.projectsVersion++;
    },
  },
});
