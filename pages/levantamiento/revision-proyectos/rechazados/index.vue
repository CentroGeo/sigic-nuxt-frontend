<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

onMounted(() => {
  storeLevantamiento.obtenerProyectosRechazados();
});

const modalComentarios = ref(null);
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
            { texto: 'Aprobados', ruta: '/levantamiento/revision-proyectos' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-proyectos/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-proyectos/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Proyectos rechazados</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.obtenerTotalProyectosEnRevision()"
            etiqueta="Proyectos"
          />
        </div>
        <div
          v-if="!storeLevantamiento.existenProyectosRechazados"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">No has rechazado proyectos</h6>
            <p class="m-t-0 m-b-1">
              Cuando algún proyecto sea dictaminado como rechazado, lo podrás ver en esta sección.
            </p>
          </div>
          <div class="columna-4"></div>
        </div>
        <div v-else>
          <div class="grid">
            <div
              v-for="proyecto in storeLevantamiento.proyectosRechazados"
              :key="proyecto.id"
              class="columna-5 fondo-color-neutro p-3 borde-redondeado-20"
            >
              <div class="flex flex-contenido-final m-b-1">
                <p
                  class="borde borde-redondeado-12 p-x-1 p-y-minimo fondo-color-error texto-color-error borde-color-error m-0"
                >
                  Rechazado
                </p>
              </div>
              <img class="icono-proyecto m-b-minimo color-invertir" src="/img/icono_sigic.png" />
              <div class="m-b-minimo texto-tamanio-4 nombre-proyecto">
                <b>{{ proyecto.nombre }}</b>
              </div>
              <div class="m-b-minimo texto-color-secundario">{{ proyecto.institucion }}</div>
              <div class="m-b-minimo texto-color-secundario">{{ proyecto.lider }}</div>
              <NuxtLink
                class="boton boton-primario boton-chico boton-accion-proyecto m-t-3 m-b-1"
                aria-label="Revisar proyecto"
                :to="`/levantamiento/revision-proyectos/rechazados/${proyecto.id}`"
              >
                Ver proyecto
              </NuxtLink>
              <button
                class="boton-secundario boton-chico boton-accion-proyecto fondo-color-primario"
                type="button"
                @click="modalComentarios.abrirModal()"
              >
                Ver comentarios
              </button>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalComentarios">
          <template #encabezado><h3>Comentarios</h3></template>
          <template #cuerpo>
            <p>El proyecto fue rechazado por los siguientes motivos:</p>
            <div class="fondo-color-error p-x-2 p-y-1 borde borde-color-error borde-redondeado-20">
              <p class="texto-color-error">
                La configuración de la información general del proyecto no está completa <br />
                El formulario de aportes tiene contenido no permitido <br />
                El contenido de tu proyecto no cumple con las políticas de uso del sistema
              </p>
            </div>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.titulo-contenido-levantamiento {
  align-items: center;
}

.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
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

.proyecto-acciones {
  gap: 8px;
}
</style>
