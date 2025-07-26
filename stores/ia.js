import { defineStore } from "pinia";
// TODO: intentar hacer un módulo para cada set proyectos,fuentes,contextos,chats

export const useIAStore = defineStore("ia", {
  state: () => ({
    existenProyectos: false,
    existeContexto: false,
  }),
  actions: {
    async crearProyecto(title, description) {
      console.log("crear proyecto")
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        //formData.append('visibility', visibilidadProyecto.value);
        formData.append('public', "False");
        //formData.append('file', "");
        
        // Agregar las capas seleccionadas si es necesario
    /*     capasSeleccionadas.value.forEach((capa, index) => {
          formData.append(`layers[${index}][id]`, capa.id);
          formData.append(`layers[${index}][title]`, capa.titulo);
          formData.append(`layers[${index}][category]`, capa.cateogria);
          formData.append(`layers[${index}][type]`, capa.tipo);
        }); */

        const response = await fetch('http://localhost:8080/api/fileuploads/workspaces/admin/create', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error al guardar el proyecto');
        }

        const data = await response.json();
        console.log('Proyecto guardado:', data);
        
        // Redirigir después de guardar
        this.existenProyectos=true;
        //navigateTo('/ia/proyectos');
        
      } catch (error) {
        console.error('Error:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    },
    crearContexto() {
      this.existeContexto = true;
    },

    async getProjectsList() {
      this.existeContexto = true;

      const response = await fetch('http://localhost:8080/api/fileuploads/workspaces/admin', {
        method: 'POST',
        body: {}
      });

      if (!response.ok) {
          throw new Error('Error al consultar proyectos');
        }

        const data = await response.json();
        //console.log('Proyectos:', data);   
        return(data)   

    },

  },
});
