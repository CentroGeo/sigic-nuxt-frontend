import { defineStore } from "pinia";
// TODO: intentar hacer un módulo para cada set proyectos,fuentes,contextos,chats

export const useIAStore = defineStore("ia", {
  state: () => ({
    existenProyectos: false,
    existeContexto: false,
    proyectos: [],
    proyectoSeleccionado: null,
    fuentesProyecto: [],
    uploadProgress: 0,
    isUploading: false,
  }),
  actions: {
    async crearProyecto(title, description, isPublic, archivos = []) {
      console.log("crear proyecto");

      // Activar estado de subida
      this.isUploading = true;
      this.uploadProgress = 0;

      try {
        const formData = new FormData();

        // Datos básicos del proyecto
        formData.append("title", title);
        formData.append("description", description);
        //formData.append('visibility', visibilidadProyecto.value);
        formData.append("public", isPublic === "publico" ? "True" : "False");

        console.log(archivos)

        // Agregar archivos si existen
        archivos.forEach((archivo, index) => {
          formData.append(`archivos`, archivo.archivo);
        });

         // Log para depuración
        for (let pair of formData.entries()) {
          console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }


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
              console.log("Proyecto guardado:", data);
              this.existenProyectos = true;
              resolve(data);
            } else {
              const error = JSON.parse(xhr.responseText)?.message || "Error al guardar";
              reject(new Error(error));
            }
          });
          
          xhr.addEventListener('error', () => {
            this.isUploading = false;
            reject(new Error("Error de conexión"));
          });
          
          xhr.addEventListener('abort', () => {
            this.isUploading = false;
            reject(new Error("Subida cancelada"));
          });
          
          xhr.open('POST', "http://localhost:8080/api/fileuploads/workspaces/admin/create");
          xhr.send(formData);
        });


      } catch (error) {
        this.isUploading = false;
        console.error("Error:", error);
        throw error; // Re-lanzamos el error para manejarlo en el componente
      }
    },

    crearContexto() {
      this.existeContexto = true;
    },

    async getProjectsList() {
      this.existeContexto = true;

      const response = await fetch(
        "http://localhost:8080/api/fileuploads/workspaces/admin",
        {
          method: "POST",
          body: {}
        }
      );

      if (!response.ok) {
        throw new Error("Error al consultar proyectos");
      }

      const data = await response.json();
      this.proyectos = data;

      if (data.length > 0) {
        this.proyectoSeleccionado = data[0];
      } else {
        this.proyectoSeleccionado = null;
      }

      this.existenProyectos = true;
      //console.log('Proyectos:', data);
      return data;
    },

    async getProjectSources(project_id) {

      const response = await fetch(
        "http://localhost:8080/api/fileuploads/workspaces/admin/"+project_id+"/files",
        {
          method: "POST",
          body: {}
        }
      );

      if (!response.ok) {
        throw new Error("Error al consultar proyectos");
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

    seleccionarProyecto(proyecto) {
      //console.log("seleccionarProyecto: ",proyecto)
      this.proyectoSeleccionado = proyecto;
    }
  }
});
