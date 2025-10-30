<script setup>
import Formulario from './formulario.vue';
import InformacionGeneral from './informacion-general.vue';
import Participantes from './participantes.vue';
import Permisos from './permisos.vue';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();
const subrutaActual = ref('informacion-general');

const opcionesMenu = [
  { texto: 'Información general', key: 'informacion-general' },
  { texto: 'Participantes', key: 'participantes' },
  { texto: 'Permisos', key: 'permisos' },
  { texto: 'Formulario', key: 'formulario' },
];

const componenteActual = computed(() => {
  switch (subrutaActual.value) {
    case 'informacion-general':
      return InformacionGeneral;
    case 'participantes':
      return Participantes;
    case 'permisos':
      return Permisos;
    case 'formulario':
      return Formulario;
    default:
      return InformacionGeneral;
  }
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div class="flex">
          <LevantamientoMenuProyectos
            v-model:subruta="subrutaActual"
            class="menu-proyectos"
            :opciones="opcionesMenu"
          />
          <button
            class="boton-primario boton-chico boton-guardar-cambios-proyecto"
            aria-label="Guardar Cambios"
          >
            Guardar Cambios <span class="pictograma-guardar"></span>
          </button>
        </div>

        <div class="flex">
          <div class="columna-4"></div>
          <div class="columna-8">
            <component :is="componenteActual" />
          </div>
          <div class="columna-4"></div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style scoped lang="scss">
.menu-proyectos {
  flex: 1;
}
.boton-guardar-cambios-proyecto {
  align-self: center;
}
</style>
