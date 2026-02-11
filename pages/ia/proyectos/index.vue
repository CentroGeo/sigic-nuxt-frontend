<script setup>
const router = useRouter();
const storeIA = useIAStore();
const idSeleccionado = computed(() => storeIA.proyectoSeleccionado?.id);

const proyectos = ref([]);
const campoBusqueda = ref('');

// Función para consultar lista de proyectos
const loadProjectList = async () => {
  let arrayProjects = [];

  // Consulta proyectos
  arrayProjects = await storeIA.getProjectsList();

  proyectos.value = arrayProjects;
  // Ir a proyecto seleccionado
  if (proyectos.value.length > 0) {
    router.push(`/ia/proyecto/${idSeleccionado.value}`);
  }
};

onMounted(() => {
  loadProjectList();
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <div>
        <div class="overflowYAuto">
          <div class="positionSticky">
            <div class="fondo-color-acento p-x-3 p-y-1">
              <h5>Proyectos</h5>
            </div>

            <div class="p-x-3 p-t-3">
              <nuxt-link
                class="boton-listas boton boton-primario m-b-3"
                aria-label="Nuevo proyecto"
                to="/ia/proyectos/crear-nuevo"
              >
                Nuevo proyecto
              </nuxt-link>

              <ClientOnly>
                <form class="campo-busqueda" @submit.prevent>
                  <input
                    id="idcampobusquedaialistas"
                    v-model="campoBusqueda"
                    class="campo-busqueda-entrada"
                    type="search"
                    :placeholder="'Buscar un proyecto'"
                    :disabled="true"
                  />
                  <button
                    v-if="campoBusqueda"
                    class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                    aria-label="Borrar"
                    type="button"
                    :disabled="true"
                    @click="removerBusqueda"
                  >
                    <span aria-hidden="true" class="pictograma-cerrar" />
                  </button>
                  <button
                    class="boton-primario boton-pictograma campo-busqueda-buscar"
                    aria-label="Buscar"
                    type="button"
                    :disabled="true"
                  >
                    <span class="pictograma-buscar" aria-hidden="true" />
                  </button>
                </form>
              </ClientOnly>
            </div>
          </div>

          <p class="m-x-3">Cuando crees un proyecto, aparecerá en esta sección.</p>
        </div>
      </div>
    </template>

    <template #visualizador>
      <main id="principal" class="">
        <div>
          <div class="flex">
            <div class="columna-4"></div>
            <div class="columna-8 flex-vertical-centrado height-vh">
              <h2 class="texto-centrado">Analiza información con Inteligencia Artificial</h2>

              <div class="fondo-color-acento p-2 borde-redondeado-8">
                <h6 class="m-t-0">Crea un proyecto para comenzar</h6>

                <p class="m-b-0">
                  Esta herramienta está diseñada para ayudarte a analizar información científica y
                  territorial mediante chats con inteligencia artificial. Para iniciar, crea
                  proyectos temáticos, agregar información del catálogo o subir tus propios
                  archivos.
                </p>
              </div>

              <div class="texto-centrado m-t-3">
                <NuxtLink
                  class="boton-primario boton-pictograma boton-grande"
                  aria-label="Crear nuevo proyecto"
                  to="/ia/proyectos/crear-nuevo"
                >
                  Crear proyecto
                  <span class="pictograma-agregar" aria-hidden="true" />
                </NuxtLink>
              </div>
            </div>
            <div class="columna-4"></div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
.height-vh {
  height: var(--altura-consulta-esc);
}
.overflowYAuto {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  .positionSticky {
    position: sticky;
    top: 0;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
}

.proyecto {
  cursor: pointer;
  border-left: var(--Escalas-Bordes-borde-8, 8px) solid transparent;

  &.seleccionado {
    border-left: var(--Escalas-Bordes-borde-8, 8px) solid var(--borde-acento);
    background: var(--fondo-acento);
  }

  .proyecto-titulo {
    color: var(--navegacion-secundaria-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }
}
</style>
