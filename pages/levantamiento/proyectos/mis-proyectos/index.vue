<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

const modalCrearProyecto = ref(null);

const handleCrearProyecto = () => {
  storeLevantamiento.guardarProyecto();
  modalCrearProyecto.value.cerrarModal();
};
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="principal-levantamiento flex contenedor m-b-10 m-t-3">
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Proyectos públicos', ruta: '/levantamiento/proyectos' },
            {
              texto: 'Mis proyectos',
              ruta: '/levantamiento/proyectos/mis-proyectos',
              notificacion: false,
            },
            {
              texto: 'Proyectos compartidos',
              ruta: '/levantamiento/proyectos/proyectos-compartidos',
              notificacion: true,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento m-b-3">
          <h2>Mis proyectos</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.obtenerTotalProyectos()"
            etiqueta="Proyectos"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenProyectos"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-documento pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">
              Crea un proyecto y empieza a recibir aportes
            </h6>
            <p class="m-t-0 m-b-1">
              Define la información general de tu proyecto, decide quiénes participarán y diseña un
              formulario para empezar a recibir aportes
            </p>
            <div class="texto-centrado">
              <button
                class="boton-primario boton-pictograma"
                @click="modalCrearProyecto.abrirModal()"
              >
                Crear un proyecto
                <span class="pictograma-agregar" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div class="columna-4"></div>
        </div>
        <div v-else>
          <div class="grid m-b-3">
            <div class="columna-8">
              <ClientOnly>
                <label for="buscadoravanzado">Buscador</label>
                <SisdaiCampoBusqueda etiqueta="" />
              </ClientOnly>
            </div>
            <div class="columna-8 flex flex-contenido-final">
              <button
                class="boton-primario boton-pictograma boton-crear-proyecto"
                @click="modalCrearProyecto.abrirModal()"
              >
                Crear un proyecto
                <span class="pictograma-agregar" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div class="grid">
            <div
              v-for="proyecto in storeLevantamiento.proyectos"
              :key="proyecto.id"
              class="columna-4 fondo-color-neutro p-3 borde-redondeado-20"
            >
              <img class="icono-proyecto m-b-minimo" src="/img/icono_sigic.png" />
              <div class="m-b-minimo texto-tamanio-4 nombre-proyecto">
                <b>{{ proyecto.nombre }}</b>
              </div>
              <div class="m-b-minimo texto-color-secundario">{{ proyecto.institucion }}</div>
              <div class="m-b-minimo texto-color-secundario">{{ proyecto.autor }}</div>
              <UiNumeroElementos :numero="proyecto.aportes" etiqueta="Aportes" />
              <NuxtLink
                class="boton boton-primario boton-chico boton-accion-proyecto m-b-1"
                aria-label="Configurar proyecto"
                :to="`/levantamiento/proyectos/mis-proyectos/${proyecto.id}`"
              >
                Configurar proyecto
              </NuxtLink>
              <button
                class="boton-secundario boton-chico boton-accion-proyecto m-b-1"
                disabled
                type="button"
              >
                Aportar
              </button>
              <button
                class="boton-secundario boton-chico boton-accion-proyecto"
                type="button m-b-1"
              >
                Eliminar proyecto
              </button>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalCrearProyecto" class="modal-grande">
          <template #encabezado> <h3>Nuevo proyecto</h3> </template>
          <template #cuerpo>
            <div class="p-3">
              <ClientOnly>
                <SisdaiCampoBase
                  etiqueta="Nombre del proyecto"
                  ejemplo="Escribe el nombre de tu proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-2"
                />
                <SisdaiSelector etiqueta="Institución a la que pertenece" class="m-b-2">
                  <option value="1">Opcion Uno</option>
                  <option value="2">Opcion Dos</option>
                  <option value="3">Opcion Tres</option>
                </SisdaiSelector>
                <SisdaiSelector etiqueta="Categoría del proyecto" class="m-b-2">
                  <option value="1">Opcion Uno</option>
                  <option value="2">Opcion Dos</option>
                  <option value="3">Opcion Tres</option>
                </SisdaiSelector>
                <SisdaiAreaTexto
                  etiqueta="Objetivo del proyecto"
                  ejemplo="Describe brevemente tu proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-2"
                />
                <SisdaiAreaTexto
                  etiqueta="Instrucciones para participantes"
                  ejemplo="Describe brevemente tu proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-2"
                />
                <label>Imagen de identificación del proyecto</label>
                <IaElementoDragNdDrop
                  ref="dragNdDrop"
                  :imagen-inicial="imagenPreview"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>
          </template>
          <template #pie>
            <button class="boton-primario boton-chico" type="button" @click="handleCrearProyecto">
              Crear proyecto
            </button>
            <button
              class="boton-secundario boton-chico"
              type="button"
              @click="modalCrearProyecto.cerrarModal()"
            >
              Regresar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.nombre-proyecto {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 22.5px;
  min-height: calc(22.5px * 3);
}

.titulo-contenido-levantamiento {
  align-items: center;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}

.boton-crear-proyecto {
  align-self: flex-end;
}

.icono-proyecto {
  width: 40px;
  height: 40px;
}

.boton-accion-proyecto {
  width: 100%;
  justify-content: center;
}
</style>
