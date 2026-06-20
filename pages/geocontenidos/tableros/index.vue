<script setup>
const { status, signIn, data: userData } = useAuth();
const { fetchSitios, eliminarSitio, togglePublic } = useTableroApi();

const estaLogueado = computed(() => status.value === 'authenticated');
const noAutenticado = computed(() => status.value === 'unauthenticated');

function iniciarSesion() {
  signIn('keycloak', { callbackUrl: '/geocontenidos/tableros' });
}

const sitios = ref([]);
const estaCargando = ref(false);

async function cargarSitios() {
  estaCargando.value = true;
  try {
    const data = await fetchSitios();
    sitios.value = data.results || [];
  } catch (e) {
    console.error('Error al cargar sitios:', e);
  } finally {
    estaCargando.value = false;
  }
}

async function borrarSitio(id) {
  if (!confirm('¿Eliminar este tablero? Esta acción no se puede deshacer.')) return;
  const ok = await eliminarSitio(id, userData.value?.accessToken);
  if (ok) {
    sitios.value = sitios.value.filter((s) => s.id !== id);
  } else {
    alert('No se pudo eliminar el tablero.');
  }
}

async function togglearPublico(sitio) {
  try {
    const data = await togglePublic(sitio.id, userData.value?.accessToken);
    if (data && typeof data.is_public === 'boolean') {
      sitio.is_public = data.is_public;
    }
  } catch (e) {
    console.error('Error al cambiar visibilidad:', e);
    alert('No se pudo cambiar la visibilidad del tablero.');
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

if (estaLogueado.value) cargarSitios();
watch(estaLogueado, (v) => {
  if (v) cargarSitios();
});
</script>

<template>
  <div>
    <!-- Sesión requerida -->
    <div v-if="noAutenticado" class="sesion-requerida">
      <span class="pictograma-candado sesion-requerida__icono" aria-hidden="true" />
      <h2 class="sesion-requerida__titulo">Acceso restringido</h2>
      <p class="sesion-requerida__desc">
        Para ver y gestionar tus tableros necesitas iniciar sesión con tu cuenta institucional.
      </p>
      <button type="button" class="boton boton-primario" @click="iniciarSesion">
        Iniciar sesión
      </button>
    </div>

    <template v-else>
      <div>
        <h2>Bienvenido a Tableros</h2>

        <p
          class="fondo-color-acento borde-redondeado-8 borde-l borde-grosor-4 p-4"
          style="border-color: var(--color-primario-4)"
        >
          Los Tableros de datos son sitios interactivos donde se presentan indicadores temáticos con
          mapas, gráficas y tarjetas de resumen, organizados en grupos y subgrupos.
        </p>

        <div v-if="estaLogueado" class="flex brecha-2 m-b-4">
          <NuxtLink to="/geocontenidos/tableros/nuevo" class="boton boton-primario">
            <span class="pictograma-agregar m-r-1" />
            Crear Tablero
          </NuxtLink>
          <NuxtLink to="/geocontenidos/importar-datos" class="boton boton-secundario">
            <span class="pictograma-archivo-subir m-r-1" />
            Desde mis datos
          </NuxtLink>
        </div>
      </div>

      <GeocontenidosLoader v-if="estaCargando" />

      <div v-else-if="sitios.length > 0" class="grid reticula-12">
        <div v-for="sitio in sitios" :key="sitio.id" class="columna-8 columna-4-esc">
          <div class="tarjeta">
            <div class="tarjeta-cuerpo">
              <p class="tarjeta-titulo">{{ sitio.name }}</p>

              <p v-if="sitio.subtitle" class="tarjeta-etiqueta">{{ sitio.subtitle }}</p>

              <p class="tarjeta-etiqueta">Creado: {{ formatearFecha(sitio.created) }}</p>
            </div>

            <div class="tarjeta-pie flex">
              <NuxtLink
                class="boton boton-chico boton-secundario"
                :to="`/tableros/${sitio.id}`"
                target="_blank"
                title="Previsualizar tablero"
              >
                <span class="pictograma-ojo-ver m-r-1" />
                Previsualizar
              </NuxtLink>

              <NuxtLink
                v-if="sitio.is_public && sitio.url"
                class="boton boton-chico boton-secundario"
                :to="`/tableros/${sitio.url}`"
                target="_blank"
                title="Ver URL pública"
              >
                <span class="pictograma-compartir m-r-1" />
                /{{ sitio.url }}
              </NuxtLink>

              <template v-if="sitio.is_owner">
                <button
                  class="boton boton-chico"
                  :class="sitio.is_public ? 'boton-secundario' : 'boton-primario'"
                  :title="sitio.is_public ? 'Hacer privado' : 'Hacer público'"
                  @click="togglearPublico(sitio)"
                >
                  <i :class="sitio.is_public ? 'fas fa-eye' : 'fas fa-eye-slash'" class="m-r-1" />
                  {{ sitio.is_public ? 'Público' : 'Privado' }}
                </button>

                <NuxtLink
                  class="boton boton-chico boton-secundario"
                  :to="`/geocontenidos/tableros/${sitio.id}`"
                >
                  <span class="pictograma-editar m-r-1" />
                  Editar
                </NuxtLink>

                <button class="boton boton-chico boton-primario" @click="borrarSitio(sitio.id)">
                  <span class="pictograma-eliminar m-r-1" />
                  Eliminar
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="texto-centrado">
        <p class="h3">No hay tableros disponibles.</p>
      </div> </template
    ><!-- /v-else autenticado -->
  </div>
</template>

<style lang="scss" scoped>
.sesion-requerida {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;

  &__icono {
    font-size: 3rem;
    color: var(--color-secundario-7, #876670);
    opacity: 0.6;
  }

  &__titulo {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-primario-4, #991f47);
    margin: 0;
  }

  &__desc {
    font-size: 1rem;
    color: var(--color-texto-secundario, #555);
    max-width: 420px;
    margin: 0;
  }
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
      gap: 0.5rem;
      padding-top: 0.75rem;
      button,
      a {
        display: block;
      }
    }
  }
}
</style>
