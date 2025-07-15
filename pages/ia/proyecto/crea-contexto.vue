<script setup>
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";
import { ref } from "vue";

const storeIA = useIAStore();
// TODO: subir lista al store
const proyectos = ref([
  {
    id: 0,
    titulo: "Biodiversidad de ecosistemas marinos",
    numero_contextos: 0,
    numero_fuentes: 9,
  },
  // {
  //   id: 1,
  //   titulo: "Nombre del proyecto",
  //   numero_contextos: 5,
  //   numero_fuentes: 5,
  // },
]);
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLayoutListas
        texto-boton="Crear proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
        :recurso-lista="proyectos"
      />
    </template>

    <template #vistas-ia>
      <div class="contenedor">
        <div class="grid">
          <div
            class="columna-16 flex flex-contenido-separado contexto-encabezado"
          >
            <h2>Configuración del contexto</h2>
            <NuxtLink
              class="boton boton-secundario boton-chico"
              aria-label="Regresar a proyectos"
              to="/ia/proyectos/"
            >
              Regresar a proyectos
              <span class="pictograma-flecha-izquierda" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
        <div class="grid">
          <div class="columna-10">
            <form action="">
              <ClientOnly>
                <SisdaiCampoBase
                  etiqueta="Nombre del contexto"
                  ejemplo=""
                  :es_etiqueta_visible="true"
                  class="m-b-3"
                />
                <SisdaiAreaTexto
                  etiqueta="Descripción del contexto (opcional)"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-3"
                />
                <SisdaiCampoBase
                  etiqueta="Portada del proyecto"
                  tipo="file"
                  class="m-b-3"
                />
              </ClientOnly>
            </form>
          </div>
        </div>
        <div class="grid">
          <div class="columna-16">
            <p class="separador borde-b" />
            <h2 class="m-b-2">Selecciona fuentes de información</h2>
            <div class="m-b-2">
              Puedes seleccionar fuentes de información agregadas o subidas al
              proyecto, para añadir más fuentes de información ve a la
              configuración del proyecto
            </div>
            <h6 class="m-t-0 m-b-2">
              Fuentes de información disponibles en el proyecto: Biodiversidad
              de ecosistemas marinos
            </h6>
            <div class="flex flex-contenido-final">
              <NuxtLink
                class="boton boton-primario boton-chico"
                aria-label="Guardar contexto"
                to="/ia/proyectos"
                @click="storeIA.crearContexto()"
              >
                Guardar contexto
              </NuxtLink>
              <button
                class="boton-chico boton-secundario"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </IaLayoutPaneles>
</template>

<style lang="scss">
.contexto-encabezado {
  align-items: center;
}
</style>
