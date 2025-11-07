<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

definePageMeta({
  middleware: 'auth',
});
const lista_proyectos = ref([
  {
    titulo: 'Biodiversidad marina en el Golfo de México',
    rol: 'Investigadora',
    anio_periodo: '2020-2022',
    enlace: 'https://proyectos.ejemplo.com/mx/biodiversidad-marina-golfo-mex',
  },
  {
    titulo: 'Monitoreo comunitario de manglares en la costa norte de Yucatán',
    rol: 'Representante de CONABIO',
    anio_periodo: '2024',
    enlace: 'https://conabio.gob.mx/proyectos/manglares-yucatan',
  },
]);
const lista_publicaciones = ref([
  {
    titulo: 'Restauración ecológica en sistemas de manglar del sureste de México',
    medio: 'Revista Mexicana de Biodiversidad',
    anio_periodo: '2023',
    enlace: 'https://publicacion.ejemplo.com/mx/biodiversidad/restauracion-manglares-2023',
  },
  {
    titulo: 'Indicadores espaciales para la conservación de ecosistemas prioritarios en México',
    medio: 'Ecología Aplicada Latinoamericana',
    anio_periodo: '2022',
    enlace: 'https://ecolatam.org/publicaciones/conservacion-ecosistemas-prioritarios-mx-2022',
  },
]);
const lista_colaboraciones = ref([
  {
    titulo: 'Programa Interinstitucional para la Restauración de Manglares',
    rol: 'Representante de CONABIO',
    anio_periodo: '2020-2023',
    instituciones: 'CONABIO, SEMARNAT, Universidad Veracruzana, WWF México',
    enlace: 'https://colaboraciones.ejemplo.com/mx/programa-restauracion-manglares',
  },
]);

const proyectoModal = ref(null);
const statusModal = ref(null);
const proyectoSeleccionado = ref({});
const tipoRecurso = ref('proyecto');
const tipoAccion = ref('crear');
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function openEditModal(proyecto, tipo, accion) {
  tipoAccion.value = accion;
  proyectoSeleccionado.value = proyecto;
  tipoRecurso.value = tipo;
  //console.log(proyectoSeleccionado.value);
  nextTick(() => {
    proyectoModal.value.abrirModalProyecto();
  });
}

function notificarStatus() {
  statusModal.value?.abrirModal();
}

function agregarNuevo() {
  statusModal.value?.cerrarModal();
  openEditModal({}, tipoRecurso.value, 'crear');
}
</script>
<template>
  <div>
    <h2>Producción y colaboraciones</h2>
    <div class="p-x-7">
      <div class="flex flex-contenido-separado">
        <h3>Proyectos y fondos SECIHTI</h3>
        <button
          type="button"
          class="boton-secundario boton-chico"
          style="height: fit-content; align-self: center"
          @click="openEditModal({}, 'proyecto', 'crear')"
        >
          Agregar proyecto +
        </button>
      </div>
      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_proyectos"
        :key="i"
        :titulo="proyecto.titulo"
        :rol="proyecto.rol"
        :anio_periodo="proyecto.anio_periodo"
        :enlace="proyecto.enlace"
        @editar-clicked="openEditModal(proyecto, 'proyecto', 'editar')"
        @eliminar-clicked="console.log('eliminar')"
      ></MiCuentaProductosTarjeta>

      <div class="flex flex-contenido-separado">
        <h3>Publicaciones</h3>
        <button
          type="button"
          class="boton-secundario boton-chico"
          style="height: fit-content; align-self: center"
          @click="openEditModal({}, 'publicación', 'crear')"
        >
          Agregar publicación +
        </button>
      </div>
      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_publicaciones"
        :key="i"
        :titulo="proyecto.titulo"
        :medio="proyecto.medio"
        :anio_periodo="proyecto.anio_periodo"
        :enlace="proyecto.enlace"
        @editar-clicked="openEditModal(proyecto, 'publicación', 'editar')"
        @eliminar-clicked="console.log('eliminar')"
      ></MiCuentaProductosTarjeta>

      <div class="flex flex-contenido-separado">
        <h3>Colaboraciones</h3>
        <button
          type="button"
          class="boton-secundario boton-chico"
          style="height: fit-content; align-self: center"
          @click="openEditModal({}, 'colaboración', 'crear')"
        >
          Agregar colaboración +
        </button>
      </div>
      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_colaboraciones"
        :key="i"
        :titulo="proyecto.titulo"
        :rol="proyecto.rol"
        :anio_periodo="proyecto.anio_periodo"
        :instituciones="proyecto.instituciones"
        :enlace="proyecto.enlace"
        @editar-clicked="openEditModal(proyecto, 'colaboración', 'editar')"
        @eliminar-clicked="console.log('eliminar')"
      ></MiCuentaProductosTarjeta>
    </div>

    <MiCuentaModalProyecto
      ref="proyectoModal"
      :key="`modal_${proyectoSeleccionado ? proyectoSeleccionado.titulo : '0'}`"
      :proyecto="proyectoSeleccionado"
      :tipo="tipoRecurso"
      @-proyecto-guardado="notificarStatus"
    ></MiCuentaModalProyecto>

    <ClientOnly>
      <SisdaiModal ref="statusModal">
        <template #encabezado>
          <h1>
            {{ capitalizeFirstLetter(tipoRecurso) }}
            {{ tipoAccion === 'crear' ? 'Guardad' : 'Editad'
            }}{{ tipoRecurso === 'proyecto' ? 'o' : 'a' }}
          </h1>
        </template>
        <template #cuerpo>
          <p v-if="tipoAccion === 'crear'">
            {{ tipoRecurso === 'proyecto' ? 'Este' : 'Esta' }} {{ tipoRecurso }} ha sido añadido a
            tu cuenta.
          </p>
          <p v-if="tipoAccion === 'editar'">La información se editó correctamente.</p>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-chico boton-con-contenedor-secundario ancho"
            @click="statusModal.cerrarModal"
          >
            Cerrar
          </button>
          <button type="button" class="boton-chico boton-primario ancho" @click="agregarNuevo">
            Agregar {{ tipoRecurso === 'proyecto' ? 'nuevo' : 'nueva' }} {{ tipoRecurso }}
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>
<style lang="scss" scoped>
.ancho {
  width: 50%;
  display: flex;
  justify-content: center; /* horizontal center */
}
</style>
