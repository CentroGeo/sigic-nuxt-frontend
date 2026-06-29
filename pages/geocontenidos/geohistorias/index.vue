<script setup>
definePageMeta({ middleware: 'auth' });

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { status, data: userData } = useAuth();
const estaLogueado = computed(() => status.value === 'authenticated');

const escenarios = ref([]);
const estaCargando = ref(false);

async function cargarEscenarios() {
  estaCargando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/`);

  const data = await respuesta.json();
  escenarios.value = data.results;
  estaCargando.value = false;
}
cargarEscenarios();

// --- Modal de confirmación de eliminación ---
const modalEliminar = ref(null);
const resourceToDelete = ref(null);
const resourceToDeleteTitle = computed(() => resourceToDelete.value?.name ?? '');
const isBeingDeleted = ref(false);
const wasDeletionSuccesful = ref(null);

function abrirModalEliminar(escenario) {
  resourceToDelete.value = escenario;
  wasDeletionSuccesful.value = null;
  modalEliminar.value?.abrir();
}

function cancelarEliminar() {
  resourceToDelete.value = null;
  modalEliminar.value?.cerrar();
}

async function confirmarEliminar() {
  if (!resourceToDelete.value) return;
  isBeingDeleted.value = true;
  const token = userData.value?.accessToken;
  const respuesta = await gnoxyFetch(
    `${config.public.geonodeApi}/scenarios/${resourceToDelete.value.id}/`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  isBeingDeleted.value = false;
  if (respuesta.ok) {
    wasDeletionSuccesful.value = true;
    escenarios.value = escenarios.value.filter((e) => e.id !== resourceToDelete.value.id);
    setTimeout(() => modalEliminar.value?.cerrar(), 1200);
  } else {
    wasDeletionSuccesful.value = false;
  }
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<template>
  <div>
    <div>
      <h2>Bienvenido a Escenarios</h2>

      <p
        class="fondo-color-acento borde-redondeado-8 borde-l borde-grosor-4 p-4"
        style="border-color: var(--color-primario-4)"
      >
        Los Escenarios son presentaciones interactivas dónde puedes mostrar mapas que cuentan una
        historia con capas de información y texto descriptivo.
      </p>

      <NuxtLink
        v-if="estaLogueado"
        to="/geocontenidos/geohistorias/nuevo/editar"
        class="boton boton-primario m-b-4"
      >
        <span class="pictograma-agregar m-r-1" />
        Crear Escenario
      </NuxtLink>
    </div>

    <GeocontenidosLoader v-if="estaCargando" />

    <div v-else-if="escenarios.length > 0" class="grid reticula-12">
      <div v-for="escenario in escenarios" :key="escenario.id" class="columna-8 columna-4-esc">
        <div class="tarjeta">
          <div class="tarjeta-cuerpo">
            <p class="tarjeta-titulo">{{ escenario.name }}</p>

            <p class="tarjeta-etiqueta">Creado: {{ formatearFecha(escenario.created_at) }}</p>
          </div>

          <div class="tarjeta-pie flex">
            <div class="fondo-color-acento borde borde-color-secundario borde-redondeado-8 m-t-2">
              <p class="m-1" style="display: flex; align-items: end; justify-content: center">
                <span class="pictograma-mapa-generador pictograma-mediano" />
                <span>
                  Escenas: <b>{{ escenario.scene_count }}</b>
                </span>
              </p>
            </div>

            <div>
              <p class="tarjeta-etiqueta m-0">
                Panel de texto: <b>{{ escenario.scenes_layout_styles.text_panel }}%</b>
              </p>
              <p class="tarjeta-etiqueta m-0">
                Panel de mapa: <b>{{ escenario.scenes_layout_styles.map_panel }}%</b>
              </p>
            </div>

            <NuxtLink
              class="boton boton-chico boton-secundario"
              :to="`/geohistorias/${escenario.id}/`"
              target="_blank"
            >
              <span class="pictograma-ojo-ver m-r-1" />
              Ver
            </NuxtLink>

            <template v-if="estaLogueado">
              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario.id}/editar`"
              >
                <span class="pictograma-editar m-r-1" />
                Editar escenario
              </NuxtLink>

              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario.id}/escenas`"
              >
                <span class="pictograma-editar m-r-1" />
                Editar escenas
              </NuxtLink>
              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/geocontenidos/geohistorias/${escenario.id}/escenas/nuevo/editar`"
              >
                <span class="pictograma-agregar m-r-1" />
                Crear escena
              </NuxtLink>
              <button
                class="boton boton-chico boton-primario"
                @click="abrirModalEliminar(escenario)"
              >
                <span class="pictograma-eliminar m-r-1" />
                Eliminar
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="texto-centrado">
      <p class="h3">No hay escenarios disponibles.</p>
    </div>

    <ClientOnly>
      <GeocontenidosSisdaiModal ref="modalEliminar" :permitir-cerrar="!isBeingDeleted">
        <template #encabezado>
          <h2 class="m-t-0">Eliminar escenario</h2>
        </template>

        <p v-if="wasDeletionSuccesful === null || isBeingDeleted" class="alerta-advertencia-modal">
          <span v-if="resourceToDelete?.is_published">
            El recurso <strong style="font-weight: bold">{{ resourceToDeleteTitle }}</strong> está
            publicado en el catálogo. Al eliminarlo, se borrará permanentemente del servidor y no
            será posible recuperarlo.
          </span>
          <span v-else>
            El recurso <strong style="font-weight: bold">{{ resourceToDeleteTitle }}</strong> será
            eliminado permanentemente del servidor y no será posible recuperarlo.
          </span>
        </p>

        <p v-else-if="wasDeletionSuccesful === true" class="texto-color-exito">
          <span class="pictograma-aprobado m-r-1" />
          El escenario fue eliminado correctamente.
        </p>

        <p v-else class="texto-color-error">No se pudo eliminar el escenario. Intenta de nuevo.</p>

        <template #pie>
          <div class="flex brecha-2 flex-contenido-final">
            <button
              class="boton boton-secundario"
              :disabled="isBeingDeleted"
              @click="cancelarEliminar"
            >
              Cancelar
            </button>
            <button
              v-if="wasDeletionSuccesful === null"
              class="boton boton-primario"
              :disabled="isBeingDeleted"
              @click="confirmarEliminar"
            >
              <span v-if="isBeingDeleted" class="cargador cargador-chico m-r-1" />
              Eliminar
            </button>
          </div>
        </template>
      </GeocontenidosSisdaiModal>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.alerta-advertencia-modal {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-neutro-5);
  margin-bottom: 24px;
}

.modulo-geocontenidos .contenedor {
  .grid.reticula-12 {
    grid-template-columns: repeat(12, 1fr);
  }
  .tarjeta {
    &-cuerpo {
      background-color: var(--color-primario-4);
      color: var(--texto-inverso);
    }
    &-pie {
      flex-direction: column;
      button,
      a {
        display: block;
      }
    }
  }
}
</style>
