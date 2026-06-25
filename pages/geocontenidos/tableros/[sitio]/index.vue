<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

definePageMeta({ middleware: 'auth' });

const { data: userData, status, signIn } = useAuth();
const route = useRoute();

const noAutenticado = computed(() => status.value === 'unauthenticated');

function iniciarSesion() {
  signIn('keycloak', { callbackUrl: route.fullPath });
}
const { fetchSitio, crearSitio, actualizarSitio, togglePublic } = useTableroApi();

const idRuta = computed(() => route.params.sitio);
const esNuevo = computed(() => idRuta.value === 'nuevo');

const modalStatus = ref(null);
const estatusAlGuardar = reactive({
  cargando: false,
  estado: undefined,
  mensaje: '',
  textoCargando: '',
});

const sitio = reactive({
  id: null,
  name: '',
  subtitle: '',
  url: '',
  title: '',
  info_text: '',
  is_public: false,
});

const togglandoPublico = ref(false);

async function togglearPublico() {
  if (!sitio.id) return;
  togglandoPublico.value = true;
  try {
    const data = await togglePublic(sitio.id, userData.value?.accessToken);
    if (data && typeof data.is_public === 'boolean') {
      sitio.is_public = data.is_public;
    }
  } catch (e) {
    console.error('Error al cambiar visibilidad:', e);
  } finally {
    togglandoPublico.value = false;
  }
}

const cargandoSitio = ref(false);

async function cargarSitio() {
  if (esNuevo.value) return;

  cargandoSitio.value = true;
  try {
    const datos = await fetchSitio(idRuta.value);
    if (datos) {
      sitio.id = datos.id;
      sitio.name = datos.name || '';
      sitio.subtitle = datos.subtitle || '';
      sitio.url = datos.url || '';
      sitio.title = datos.title || '';
      sitio.info_text = datos.info_text || '';
      sitio.is_public = datos.is_public ?? false;
    }
  } catch (e) {
    console.error('Error al cargar sitio:', e);
  } finally {
    cargandoSitio.value = false;
  }
}

function aplicarCambios(cambios) {
  Object.assign(sitio, cambios);
}

async function guardar() {
  modalStatus.value?.abrirModal();
  estatusAlGuardar.cargando = true;
  estatusAlGuardar.textoCargando = esNuevo.value ? 'Creando tablero...' : 'Guardando cambios...';
  estatusAlGuardar.estado = undefined;

  const payload = {
    name: sitio.name,
    subtitle: sitio.subtitle,
    url: sitio.url,
    title: sitio.title,
    info_text: sitio.info_text,
    ...(esNuevo.value ? { is_public: false } : {}),
  };

  try {
    const token = userData.value?.accessToken;
    const data = esNuevo.value
      ? await crearSitio(payload, token)
      : await actualizarSitio(sitio.id, payload, token);

    if (data?.id) {
      estatusAlGuardar.cargando = false;
      estatusAlGuardar.estado = true;
      sitio.id = data.id;

      setTimeout(() => {
        modalStatus.value?.cerrarModal();
        if (esNuevo.value) navigateTo(`/geocontenidos/tableros/${data.id}`);
      }, 1200);
    } else {
      estatusAlGuardar.cargando = false;
      estatusAlGuardar.estado = false;
      estatusAlGuardar.mensaje = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    estatusAlGuardar.cargando = false;
    estatusAlGuardar.estado = false;
    estatusAlGuardar.mensaje = e?.message || 'Error desconocido';
  }
}

const pestanias = computed(() => [
  { id: 'identidad', titulo: 'Identidad del sitio' },
  { id: 'estructura', titulo: 'Estructura', deshabilitada: esNuevo.value },
  { id: 'datos', titulo: 'Datos estáticos', deshabilitada: esNuevo.value },
]);

cargarSitio();
</script>

<template>
  <section>
    <!-- Sesión requerida -->
    <div v-if="noAutenticado" class="sesion-requerida">
      <span class="pictograma-candado sesion-requerida__icono" aria-hidden="true" />
      <h2 class="sesion-requerida__titulo">Acceso restringido</h2>
      <p class="sesion-requerida__desc">
        Para editar este tablero necesitas iniciar sesión con tu cuenta institucional.
      </p>
      <button type="button" class="boton boton-primario" @click="iniciarSesion">
        Iniciar sesión
      </button>
    </div>

    <template v-else>
      <GeocontenidosTituloVolver
        :titulo="esNuevo ? 'Nuevo tablero' : `Editar tablero: ${sitio.name}`"
        volver="/tableros"
      />

      <div v-if="!esNuevo && sitio.id" class="flex brecha-2 m-b-3">
        <NuxtLink
          :to="`/tableros/${sitio.id}`"
          class="boton boton-secundario boton-chico"
          target="_blank"
        >
          <span class="pictograma-visualizar m-r-1" />
          Ver tablero
        </NuxtLink>

        <button
          type="button"
          class="boton boton-chico"
          :class="sitio.is_public ? 'boton-secundario' : 'boton-primario'"
          :disabled="togglandoPublico"
          @click="togglearPublico"
        >
          <span
            :class="sitio.is_public ? 'pictograma-ojo' : 'pictograma-ojo-cerrado'"
            class="m-r-1"
          />
          {{
            togglandoPublico
              ? 'Cambiando...'
              : sitio.is_public
                ? 'Público — hacer privado'
                : 'Privado — hacer público'
          }}
        </button>
      </div>

      <GeocontenidosLoader v-if="cargandoSitio" mensaje="Cargando tablero..." />

      <GeocontenidosPestanias v-else :pestanias="pestanias" id-seleccion="identidad">
        <template #contenido-identidad>
          <TablerosAdminTabIdentidad
            :sitio="sitio"
            @actualizar="aplicarCambios"
            @guardar="guardar"
          />
        </template>

        <template #contenido-estructura>
          <TablerosAdminTabEstructura v-if="sitio.id" :site-id="sitio.id" />
        </template>

        <template #contenido-datos>
          <TablerosAdminTabDatos v-if="sitio.id" :site-id="sitio.id" />
        </template>
      </GeocontenidosPestanias>

      <ClientOnly>
        <SisdaiModal ref="modalStatus">
          <template #encabezado>
            <span v-if="estatusAlGuardar.cargando" />
            <h2 v-else>
              {{ estatusAlGuardar.estado ? 'Guardado con éxito' : 'Error al guardar' }}
            </h2>
          </template>

          <template #cuerpo>
            <GeocontenidosLoader
              v-if="estatusAlGuardar.cargando"
              :mensaje="estatusAlGuardar.textoCargando"
            />

            <p v-else-if="estatusAlGuardar.estado === false" v-text="estatusAlGuardar.mensaje" />

            <p v-else class="texto-centrado">
              <span class="pictograma-aprobado pictograma-grande" />
            </p>
          </template>
        </SisdaiModal>
      </ClientOnly> </template
    ><!-- /v-else autenticado -->
  </section>
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
</style>
