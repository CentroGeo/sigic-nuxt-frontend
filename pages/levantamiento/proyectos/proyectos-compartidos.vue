<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';

definePageMeta({
  middleware: 'auth',
});

const notificaciones = [
  {
    id: 1,
    email: 'persona_usuaria@email.com',
    proyecto: { nombre: 'Registro de arte urbano en la ciudad de Mérida' },
  },
  {
    id: 2,
    email: 'persona_usuaria@email.com',
    proyecto: { nombre: 'Mapa de puntos de basura acumulada' },
  },
  {
    id: 3,
    email: 'persona_usuaria@email.com',
    proyecto: { nombre: 'Registro de cruces peatonales peligrosos' },
  },
  {
    id: 4,
    email: 'persona_usuaria@email.com',
    proyecto: { nombre: 'Inventario de faroles en el barrio Flores del Amanecer' },
  },
];

const storeLevantamiento = useLevantamientoStore();
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
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

        <div class="flex titulo-contenido-levantamiento">
          <h2>Proyectos públicos</h2>
          <UiNumeroElementos
            :numero="storeLevantamiento.obtenerTotalProyectosPublicos()"
            etiqueta="Proyectos"
          />
        </div>
        <div class="grid m-b-3">
          <div class="columna-8">
            <ClientOnly>
              <label for="buscadoravanzado">Buscador</label>
              <SisdaiCampoBusqueda etiqueta="" />
            </ClientOnly>
          </div>
        </div>
        <div
          class="texto-color-informacion fondo-color-informacion borde-redondeado-20 borde borde-color-informacion p-3 m-b-3"
        >
          <div class="m-b-1 flex flex-contenido-separado">
            <p class="m-0 titulo-notificaciones">
              <span class="pictograma-informacion" />
              <span class="m-l-1">Notificaciones</span>
            </p>
            <button
              class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
              @click="eliminarOpcion(index)"
            >
              <span class="pictograma-cerrar" aria-hidden="true" />
            </button>
          </div>
          <div v-for="notificacion in notificaciones" :key="notificacion.id">
            <p class="m-0">
              <span class="m-r-3 texto-tamanio-2">{{ notificacion.email }} compartió contigo:</span>
              <span class="texto-peso-600 notificacion-proyecto">{{
                notificacion.proyecto.nombre
              }}</span>
            </p>
          </div>
        </div>
        <div class="grid">
          <div
            v-for="proyecto in storeLevantamiento.proyectosPublicos"
            :key="proyecto.id"
            class="columna-4 fondo-color-neutro p-3 borde-redondeado-20"
          >
            <img class="icono-proyecto m-b-minimo color-invertir" src="/img/icono_sigic.png" />
            <div class="m-b-minimo texto-tamanio-4 nombre-proyecto">
              <b>{{ proyecto.nombre }}</b>
            </div>
            <div class="m-b-minimo texto-color-secundario">{{ proyecto.institucion }}</div>
            <div class="m-b-minimo texto-color-secundario">{{ proyecto.autor }}</div>
            <UiNumeroElementos :numero="proyecto.aportes" etiqueta="Aportes" class="m-b-3" />
            <NuxtLink
              class="boton boton-primario boton-chico boton-accion-proyecto m-b-1"
              aria-label="Ver proyecto"
              :to="`/levantamiento/proyectos/proyecto/${proyecto.id}`"
            >
              Ver proyecto
            </NuxtLink>
            <button
              class="boton-secundario boton-chico boton-accion-proyecto fondo-color-primario m-b-1"
              type="button"
            >
              Aportar
            </button>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
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

.icono-proyecto {
  width: 40px;
  height: 40px;
}

.boton-accion-proyecto {
  width: 100%;
  justify-content: center;
}

.titulo-notificaciones {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.notificacion-proyecto {
  text-decoration: underline;
}
</style>
