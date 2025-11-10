<script setup>
import { useRouter } from 'vue-router';
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

const router = useRouter();

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

function irAMisProyectos() {
  router.push('/levantamiento/proyectos/mis-proyectos');
}
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="mis-proyectos-levantamiento contenedor m-b-10 m-t-3">
        <div class="grid m-b-3">
          <div class="columna-16 flex regresar mis-proyectos-encabezado">
            <div class="boton-regresar">
              <button
                class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
                aria-label="Regresar a proyectos"
                type="button"
                @click="irAMisProyectos"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Mis proyectos
            </div>
          </div>
        </div>
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

        <div class="flex mis-proyectos-contenedor flex-contenido-centrado">
          <div
            :class="
              subrutaActual === 'participantes' || subrutaActual === 'permisos'
                ? 'columna-3'
                : 'columna-4'
            "
          ></div>
          <component :is="componenteActual" />
          <div
            :class="
              subrutaActual === 'participantes' || subrutaActual === 'permisos'
                ? 'columna-3'
                : 'columna-4'
            "
          ></div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style scoped lang="scss">
.regresar {
  &.mis-proyectos-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;

    .boton-regresar {
      display: flex;
      align-items: center;
      font-size: var(--Tipos-Tamao-Prrafos-Texto-alto, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: var(--Tipos-Interlineado-Prrafos-Texto-alto, 30px);
    }
  }
}

.menu-proyectos {
  flex: 1;
}
.boton-guardar-cambios-proyecto {
  align-self: center;
}

.mis-proyectos-levantamiento {
  display: flex;
  flex-direction: column;
}

.mis-proyectos-contenedor {
  flex: 1;
}
</style>
