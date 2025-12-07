<script setup>
/**TODO: agregar método para traer la info del usuario al store */
import { buildUrl } from '~/utils/consulta';

definePageMeta({
  middleware: 'redireccionar-modulo-catalogo',
  bodyAttrs: {
    class: '',
  },
});

const { data, status } = useAuth();
const estaLogueado = computed(() => status.value === 'authenticated');

const ruta = '/catalogo';
const storeCatalogo = useCatalogoStore();

const esSuperusuario = ref(false);

onMounted(async () => {
  if (estaLogueado.value) {
    try {
      const configEnv = useRuntimeConfig();
      const { gnoxyFetch } = useGnoxyUrl();
      const userEmail = data.value?.user.email;
      const baseUrl = configEnv.public.geonodeApi;
      const queryParams = {
        page_size: 1,
        'filter{email}': userEmail,
      };

      // petición para traer solo el usuario que coincida con el parámetro email
      const url = buildUrl(`${baseUrl}/users`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      const userInfo = res.users;

      // almacenando en el store
      // storeCatalogo.userInfo = userInfo[0];
      // esSuperusuario.value = storeCatalogo.userInfo.is_superuser;
      esSuperusuario.value = userInfo[0].is_superuser;
    } catch (error) {
      console.error(error);
    }
  }
});
onUnmounted(() => (document.querySelector('body').className = ''));
</script>

<template>
  <div class="modulo-catalogo flex">
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-explorar',
          ruta: `${ruta}/explorar`,
          globo: 'Explorar',
        },
        {
          pictograma: 'pictograma-capas',
          ruta: `${ruta}/explorar/capas`,
          globo: 'Capas',
        },
        {
          pictograma: 'pictograma-tabla',
          ruta: `${ruta}/explorar/tablas`,
          globo: 'Datos tabulados',
        },
        {
          pictograma: 'pictograma-documento',
          ruta: `${ruta}/explorar/documentos`,
          globo: 'Documentos',
        },
      ]"
      :sesion-paginas="[
        {
          pictograma: 'pictograma-proyectos',
          ruta: `${ruta}/mis-archivos`,
          globo: 'Mis archivos',
        },
        {
          pictograma: 'pictograma-archivo-subir',
          ruta: `${ruta}/cargar-archivos`,
          globo: 'Carga de archivos',
        },
        {
          pictograma: 'pictograma-ayuda',
          ruta: `${ruta}/servicios-remotos`,
          globo: 'Carga de catálogos externos',
        },
        esSuperusuario
          ? {
              pictograma: 'pictograma-ayuda',
              ruta: `${ruta}/revision-solicitudes`,
              globo: 'Revisión de solicitudes',
            }
          : {},
      ]"
      :id-colapsable="storeCatalogo.idNavegacionLateral"
      :estado-colapable="storeCatalogo.catalogoColapsado"
      :funcion-colapsar="storeCatalogo.alternarCatalogoColapsable"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss">
.modulo-catalogo {
  gap: 0;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
